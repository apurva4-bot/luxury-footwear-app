import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true }, // Sparse allows users without phones (old accounts)
  password: { type: String }, // Made optional because OTP-only users don't need a password
  role: { type: String, default: 'user' },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});
const User = mongoose.model('User', UserSchema);

// Schema to store OTP codes temporarily (expires after 5 minutes)
const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
});
const Otp = mongoose.model('Otp', OtpSchema);

const ProductSchema = new mongoose.Schema({
  name: String, price: Number, image: String,
  category: { type: String, default: 'luxury' },
  variants: [{ color: String, image: String }] 
});
const Product = mongoose.model('Product', ProductSchema);

const VisitorLogSchema = new mongoose.Schema({
  visitorId: String, ip: String, timestamp: { type: Date, default: Date.now }
});
const VisitorLog = mongoose.model('VisitorLog', VisitorLogSchema);

app.use((req, res, next) => {
  const visitorId = req.headers['x-visitor-id'] || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress;
  VisitorLog.create({ visitorId, ip }).catch(err => console.error("Log error", err));
  next();
});

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) { res.status(401).json({ error: "Invalid token" }); }
};

// --- CLASSIC USERNAME/PASSWORD ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), password: hashedPassword, role: role || 'user' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, role: user.role, cart: [], wishlist: [] } });
  } catch (error) { 
    if (error.code === 11000) return res.status(400).json({ error: "Username already exists." });
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username.trim() }).populate('cart').populate('wishlist');
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, phone: user.phone, role: user.role, cart: user.cart, wishlist: user.wishlist } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- NEW WIRELESS OTP AUTH ROUTES ---
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    // Generate a random 6-digit number
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear old OTPs for this phone number and save the new one
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code: otpCode });

    // SIMULATED SMS SENDING: Logs directly to your Render Terminal screen
    console.log(`\n==========================================\n📲 [SMS GATEWAY SIMULATION] \nOTP Code for ${phone} is: ${otpCode}\n==========================================\n`);

    // Return it in response so you can read it easily in testing alerts
    res.json({ success: true, message: "OTP sent successfully!", debugOtp: otpCode });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and OTP code are required" });

  try {
    const otpRecord = await Otp.findOne({ phone, code });
    if (!otpRecord) return res.status(401).json({ error: "Invalid or expired OTP code" });

    // Check if user already exists with this phone number
    let user = await User.findOne({ phone }).populate('cart').populate('wishlist');
    
    if (!user) {
      // Auto-register them if they are brand new! Create a default username from phone
      const generatedUsername = `user_${phone.slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      user = await User.create({
        username: generatedUsername,
        phone: phone,
        role: 'user'
      });
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, phone: user.phone, role: user.role, cart: user.cart || [], wishlist: user.wishlist || [] } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- CART, WISHLIST, AND PRODUCT ENDPOINTS STAY EXACTLY THE SAME ---
app.get('/api/products', async (req, res) => { res.json(await Product.find()); });
app.post('/api/products', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  res.json(await Product.create(req.body));
});
app.put('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  await Product.findByIdAndDelete(req.params.id); res.json({ success: true });
});
app.get('/api/cart', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).populate('cart'); res.json({ cart: user.cart || [] });
});
app.post('/api/cart', requireAuth, async (req, res) => {
  const { action, productId } = req.body; const user = await User.findById(req.userId);
  if (action === 'add') user.cart.push(productId);
  else if (action === 'remove') { const idx = user.cart.indexOf(productId); if (idx > -1) user.cart.splice(idx, 1); }
  await user.save(); res.json({ cart: (await User.findById(req.userId).populate('cart')).cart });
});
app.get('/api/wishlist', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).populate('wishlist'); res.json({ wishlist: user.wishlist || [] });
});
app.post('/api/wishlist', requireAuth, async (req, res) => {
  const { action, productId } = req.body; const user = await User.findById(req.userId);
  if (action === 'add') { if (!user.wishlist.includes(productId)) user.wishlist.push(productId); }
  else if (action === 'remove') user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save(); res.json({ wishlist: (await User.findById(req.userId).populate('wishlist')).wishlist });
});
app.post('/api/checkout', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).populate('cart');
  if (!user || user.cart.length === 0) return res.status(400).json({ error: "Cart empty" });
  const total = user.cart.reduce((s, i) => s + i.price, 0);
  await transporter.sendMail({
    from: process.env.EMAIL_USER, to: process.env.EMAIL_USER,
    subject: `🚨 NEW ORDER ALERT: Rs ${total}`, text: `User: ${user.username}\nPhone: ${user.phone || 'N/A'}`
  });
  user.cart = []; await user.save(); res.json({ success: true });
});
app.get('/api/admin', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  res.json({ users: await User.find().select('-password'), logs: await VisitorLog.find().sort({ timestamp: -1 }).limit(100), productCount: await Product.countDocuments() });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));