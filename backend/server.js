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

// --- FIX: CLEAN & STABLE CORS ORIGIN FUNCTION ---
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
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});
const User = mongoose.model('User', UserSchema);

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

// --- VISITOR TRACKING ---
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
  } catch (err) { res.status(401).json({ error: "Invalid token" }); }
};

// --- ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: role || 'user' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, role: user.role, cart: [], wishlist: [] } });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).populate('cart').populate('wishlist');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, role: user.role, cart: user.cart, wishlist: user.wishlist } });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const product = await Product.create(req.body);
  res.json(product);
});

app.put('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) { res.status(500).json({ error: "Failed to update" }); }
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- FIXED CART ENDPOINTS ---
// GET: Fetches current items inside the cart
app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart');
    res.json({ cart: user.cart || [] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST: Add or remove operations
app.post('/api/cart', requireAuth, async (req, res) => {
  const { action, productId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (action === 'add') { user.cart.push(productId); } 
    else if (action === 'remove') {
      const index = user.cart.indexOf(productId);
      if (index > -1) user.cart.splice(index, 1);
    }
    await user.save();
    const updatedUser = await User.findById(req.userId).populate('cart');
    res.json({ cart: updatedUser.cart });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- FIXED WISHLIST ENDPOINTS ---
// GET: Fetches current items inside the wishlist
app.get('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    res.json({ wishlist: user.wishlist || [] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST: Add or remove operations
app.post('/api/wishlist', requireAuth, async (req, res) => {
  const { action, productId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (action === 'add') { 
      if (!user.wishlist.includes(productId)) user.wishlist.push(productId); 
    } 
    else if (action === 'remove') {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    }
    await user.save();
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    res.json({ wishlist: updatedUser.wishlist });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/checkout', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart');
    if (user.cart.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const total = user.cart.reduce((sum, item) => sum + item.price, 0);
    const itemNames = user.cart.map(item => item.name).join(', ');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🚨 NEW ORDER ALERT: Rs ${total} from ${user.username}`,
      text: `Woohoo! You have a new order on Ethereal.\n\nCustomer: ${user.username}\nItems Purchased: ${itemNames}\nTotal Value: Rs ${total}\n\nKeep up the great work!`
    };

    await transporter.sendMail(mailOptions);

    user.cart = [];
    await user.save();
    res.json({ success: true, message: "Order placed! The admin has been notified." });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Failed to process checkout and send email." }); 
  }
});

app.get('/api/admin', requireAuth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const users = await User.find().select('-password');
  const logs = await VisitorLog.find().sort({ timestamp: -1 }).limit(100);
  const productCount = await Product.countDocuments();
  res.json({ users, logs, productCount });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});