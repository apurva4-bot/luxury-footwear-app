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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-visitor-id']
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Failure:", err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true }, 
  password: { type: String }, 
  role: { type: String, default: 'user' },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});
const User = mongoose.model('User', UserSchema);

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
});
const Otp = mongoose.model('Otp', OtpSchema);

const ProductSchema = new mongoose.Schema({
  name: String, 
  price: Number, 
  image: String,
  category: { type: String, default: 'luxury' },
  variants: [{ color: String, image: String }] 
});
const Product = mongoose.model('Product', ProductSchema);

const VisitorLogSchema = new mongoose.Schema({
  visitorId: String, 
  ip: String, 
  timestamp: { type: Date, default: Date.now }
});
const VisitorLog = mongoose.model('VisitorLog', VisitorLogSchema);

// --- VISITOR LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  const visitorId = req.headers['x-visitor-id'] || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress;
  VisitorLog.create({ visitorId, ip }).catch(err => console.error("Log error", err));
  next();
});

// --- AUTH MIDDLEWARE ---
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) { 
    return res.status(401).json({ error: "Invalid token" }); 
  }
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const usernameInput = req.body.username || req.body.email || "";
    const passwordInput = req.body.password || "";

    if (!usernameInput || !passwordInput) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }
    
    const cleanUsername = String(usernameInput).trim();
    const cleanPassword = String(passwordInput);

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const user = await User.create({ 
      username: cleanUsername, 
      password: hashedPassword, 
      role: req.body.role || 'user' 
    });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, role: user.role, cart: [], wishlist: [] } });
  } catch (error) { 
    if (error.code === 11000) return res.status(400).json({ error: "Username or Email already exists." });
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const usernameInput = req.body.username || req.body.email || "";
    const passwordInput = req.body.password || "";

    if (!usernameInput || !passwordInput) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }

    const cleanUsername = String(usernameInput).trim();
    const cleanPassword = String(passwordInput);

    const user = await User.findOne({ username: cleanUsername }).populate('cart').populate('wishlist');
    if (!user || !user.password || !(await bcrypt.compare(cleanPassword, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, phone: user.phone, role: user.role, cart: user.cart, wishlist: user.wishlist } });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code: otpCode });

    console.log(`\n==========================================\n📲 [SMS GATEWAY SIMULATION] \nOTP Code for ${phone} is: ${otpCode}\n==========================================\n`);
    res.json({ success: true, message: "OTP sent successfully!", debugOtp: otpCode });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and OTP code are required" });

  try {
    const otpRecord = await Otp.findOne({ phone, code });
    if (!otpRecord) return res.status(401).json({ error: "Invalid or expired OTP code" });

    let user = await User.findOne({ phone }).populate('cart').populate('wishlist');
    if (!user) {
      const generatedUsername = `user_${phone.slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      user = await User.create({ username: generatedUsername, phone: phone, role: 'user' });
    }

    await Otp.deleteOne({ _id: otpRecord._id });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, phone: user.phone, role: user.role, cart: user.cart || [], wishlist: user.wishlist || [] } });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// --- PRODUCT MANAGEMENT ENDPOINTS ---
app.get('/api/products', async (req, res) => { 
  try {
    const products = await Product.find();
    res.json(products); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  try {
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  try {
    await Product.findByIdAndDelete(req.params.id); 
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CART ENDPOINTS ---
app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart'); 
    res.json({ cart: user?.cart || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', requireAuth, async (req, res) => {
  const { action, productId } = req.body; 
  if (!productId) return res.status(400).json({ error: "Product ID is required" });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.cart) user.cart = [];

    if (action === 'add') {
      user.cart.push(productId);
    } else if (action === 'remove') {
      user.cart = user.cart.filter(item => item && item.toString() !== productId.toString());
    }

    await user.save(); 
    const updatedUser = await User.findById(req.userId).populate('cart');
    res.json({ cart: updatedUser.cart || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- WISHLIST ENDPOINTS ---
app.get('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist'); 
    res.json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wishlist', requireAuth, async (req, res) => {
  const { action, productId } = req.body; 
  if (!productId) return res.status(400).json({ error: "Product ID is required" });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.wishlist) user.wishlist = [];

    if (action === 'add') {
      if (!user.wishlist.some(id => id && id.toString() === productId.toString())) {
        user.wishlist.push(productId);
      }
    } else if (action === 'remove') {
      user.wishlist = user.wishlist.filter(id => id && id.toString() !== productId.toString());
    }

    await user.save(); 
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    res.json({ wishlist: updatedUser.wishlist || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CHECKOUT ENDPOINT ---
app.post('/api/checkout', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart');
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    const total = user.cart.reduce((s, i) => s + (i.price || 0), 0);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,
      subject: `🚨 NEW ORDER ALERT: Rs ${total}`, 
      text: `User: ${user.username}\nPhone: ${user.phone || 'N/A'}\nItems: ${user.cart.length}`
    });

    user.cart = []; 
    await user.save(); 
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN SYSTEM MONITOR ---
app.get('/api/admin', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  try {
    res.json({ 
      users: await User.find().select('-password'), 
      logs: await VisitorLog.find().sort({ timestamp: -1 }).limit(100), 
      productCount: await Product.countDocuments() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));