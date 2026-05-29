import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Trash2, Pencil, X, Check, Heart, Menu, Ruler, Eye, EyeOff, LogOut } from 'lucide-react';
import ProductDetailPage from './ProductDetailPage';

// Fixed backend server domain
const API_URL = 'https://luxury-footwear-app.onrender.com';

const getVisitorId = () => {
  let vid = localStorage.getItem('visitor_id');
  if (!vid) {
    vid = 'vid_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', vid);
  }
  return vid;
};

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'x-visitor-id': getVisitorId(),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

const AppContext = createContext();

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_details');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          const cartRes = await fetchAPI('/cart');
          setCart(cartRes.cart || []);
          
          const wishRes = await fetchAPI('/wishlist');
          setWishlist(wishRes.wishlist || []);
        } catch (err) {
          console.error("Session initialization failed", err);
          logout();
        }
      }
    };
    initializeUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_details');
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  return (
    <AppContext.Provider value={{ user, setUser, cart, setCart, wishlist, setWishlist, logout }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans text-stone-800">
          
          <div className="bg-stone-900 text-stone-100 text-[10px] sm:text-xs text-center py-2 uppercase tracking-widest font-medium z-50 relative">
            Complimentary Shipping on all domestic orders over Rs 5,000
          </div>
          
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/summer" element={<SummerPage />} />
              <Route path="/casual" element={<CasualPage />} />
              
              <Route path="/bellis" element={<div className="container mx-auto px-4 py-16 max-w-6xl"><Products category="bellis" title="Bellis Collection" /></div>} />
              <Route path="/stiletto" element={<div className="container mx-auto px-4 py-16 max-w-6xl"><Products category="stiletto" title="Stiletto Heels" /></div>} />
              <Route path="/wedges" element={<div className="container mx-auto px-4 py-16 max-w-6xl"><Products category="wedges" title="Wedges Collection" /></div>} />
              <Route path="/platform" element={<div className="container mx-auto px-4 py-16 max-w-6xl"><Products category="platform" title="Platform Shoes" /></div>} />
              <Route path="/kitten" element={<div className="container mx-auto px-4 py-16 max-w-6xl"><Products category="kitten" title="Kitten Heels" /></div>} />

              <Route path="/auth" element={<div className="container mx-auto px-4 py-8 max-w-md"><Auth /></div>} />
              <Route path="/cart" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Cart /></div>} />
              <Route path="/wishlist" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Wishlist /></div>} /> 
              <Route path="/admin" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Admin /></div>} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
            </Routes>
          </main>
          
          <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 text-center text-sm">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 mb-12">
              <div>
                <h4 className="text-white uppercase tracking-widest mb-4">Luxury Footwear</h4>
                <p className="text-stone-500">Minimalist luxury for the modern walk. Designed with passion.</p>
              </div>
              <div>
                <h4 className="text-white uppercase tracking-widest mb-4">Contact</h4>
                <p>Email: tongeapurva4@gmail.com</p>
                <p>Phone: 8432171256</p>
              </div>
              <div>
                <h4 className="text-white uppercase tracking-widest mb-4">Follow Us</h4>
                <p className="cursor-pointer hover:text-white">Instagram</p>
                <p className="cursor-pointer hover:text-white">Twitter</p>
              </div>
            </div>
            <div className="border-t border-stone-800 pt-8">
              <p>© {new Date().getFullYear()} Luxury Footwear. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

function Home() {
  const categories = [
    { name: 'Bellis', path: '/bellis', image: '/images/home/catalogues/bellis/bellis.jpg' },
    { name: 'Stiletto', path: '/stiletto', image: '/images/home/catalogues/stiletto/stiletto.jpg' },
    { name: 'Wedges', path: '/wedges', image: '/images/home/catalogues/wedges/wedges.jpg' },
    { name: 'Platform', path: '/platform', image: '/images/home/catalogues/platform/platform.jpg' },
    { name: 'Kitten', path: '/kitten', image: '/images/home/catalogues/kitten/kitten.jpg' }
  ];

  return (
    <div className="flex flex-col w-full">
      <section className="w-full bg-stone-100">
        <img src="/images/home/editorial_banner.jpeg" alt="Kitten Heel Collection" className="w-full h-auto object-cover" />
      </section>

      <section className="py-12 bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-center text-xl font-light uppercase tracking-widest text-stone-900 mb-10">Occasional Luxury</h2>
          <div className="flex justify-start md:justify-center gap-8 overflow-x-auto pb-6 no-scrollbar snap-x">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.path} className="flex flex-col items-center min-w-[80px] snap-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-100 mb-4 overflow-hidden border border-stone-200 group-hover:border-stone-900 transition-colors shadow-sm">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-stone-600 group-hover:text-stone-900 font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-light mb-6 uppercase tracking-widest text-stone-900">Walk in Elegance</h1>
        <p className="text-stone-500 max-w-xl mx-auto mb-10 text-lg">Discover our latest collection of handcrafted luxury footwear, designed to elevate your everyday journey.</p>
        <Link to="/summer" className="bg-stone-900 text-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-stone-800 transition-colors">
          Explore Summer Collection
        </Link>
      </section>

      <section className="container mx-auto px-4 pb-24 max-w-6xl">
        <Products category="luxury" title="Trending Arrivals" />
      </section>
    </div>
  );
}

function SummerPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="w-full bg-stone-100">
        <img src="/images/season/summer_special.png" alt="Summer Collection" className="w-full h-auto object-cover" />
      </section>
      <section className="container mx-auto px-4 py-24 max-w-6xl">
        <Products category="summer" title="Summer Special: Beach Ready" />
      </section>
    </div>
  );
}

function CasualPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="w-full bg-stone-100">
        <img src="/images/casual/casual_banner.jpg" alt="Casual Wear Collection" className="w-full h-auto object-cover" />
      </section>
      <section className="container mx-auto px-4 py-24 max-w-6xl">
        <Products category="casual" title="Casual Wear Collection" />
      </section>
    </div>
  );
}

function Navbar() {
  const { user, cart, wishlist, logout } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 relative">
      <div className="w-full px-4 md:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-stone-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
          <Link to="/" className="text-sm md:text-lg font-light tracking-[0.2em] uppercase text-stone-900 whitespace-nowrap">
            WOMENS LUXURY FOOTWEAR
          </Link>
        </div>
        
        <div className="hidden lg:flex gap-10 text-sm uppercase tracking-wider">
          <Link to="/" className="hover:text-stone-500 transition-colors">Home</Link>
          <Link to="/summer" className="text-orange-800 hover:text-orange-500 transition-colors">Summer Special</Link>
          <Link to="/casual" className="hover:text-stone-500 transition-colors">Casual Wear</Link>
        </div>

        <div className="flex gap-4 md:gap-6 items-center">
          {user?.role === 'admin' && <Link to="/admin" className="hidden md:block text-sm uppercase tracking-wide hover:text-stone-500">Admin</Link>}
          <Link to="/wishlist" className="relative hover:text-red-500 transition-colors">
            <Heart size={20} strokeWidth={1.5} />
            {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="relative hover:text-stone-500">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
          </Link>
          {user ? (
            <button onClick={logout} className="hover:text-stone-500 hidden sm:block"><LogOut size={20} strokeWidth={1.5} /></button>
          ) : (
            <Link to="/auth" className="hover:text-stone-500 hidden sm:block"><UserIcon size={20} strokeWidth={1.5} /></Link>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 shadow-xl py-4 px-6 flex flex-col gap-6 text-sm uppercase tracking-wider z-50">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-500 transition-colors">Home</Link>
          <Link to="/summer" onClick={() => setIsMobileMenuOpen(false)} className="text-orange-800 hover:text-orange-500 transition-colors">Summer Special</Link>
          <Link to="/casual" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-500 transition-colors">Casual Wear</Link>
          <hr className="border-stone-100" />
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-500 transition-colors">Admin Dashboard</Link>}
          {user ? (
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left hover:text-stone-500 flex items-center gap-2"><LogOut size={16} /> Logout</button>
          ) : (
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-500 flex items-center gap-2"><UserIcon size={16} /> Login / Register</Link>
          )}
        </div>
      )}
    </nav>
  );
}

function Products({ category, title }) {
  const [products, setProducts] = useState([]);
  const { user, setCart } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = () => { fetchAPI('/products').then(setProducts).catch(console.error); };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetchAPI(`/products/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) { alert("Failed to delete"); }
  };

  const displayedProducts = products.filter(p => (p.category || 'luxury') === category);

  return (
    <div>
      <h2 className="text-2xl font-light mb-12 uppercase tracking-widest text-center">{title}</h2>
        <div className="grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-3 lg:grid-cols-4 px-1"> 
        {displayedProducts.map(p => (
          <ProductCard key={p._id} p={p} user={user} handleDelete={handleDelete} fetchProducts={fetchProducts} navigate={navigate} setCart={setCart} />
        ))}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
function ProductCard({ p, user, handleDelete, fetchProducts, navigate, setCart }) {
  const [isEditing, setIsEditing] = useState(false);
  const imageUrls = p.image ? p.image.split('|').map(url => url.trim()).filter(Boolean) : [];
  const [currentImage, setCurrentImage] = useState('');
  const { wishlist, setWishlist } = useContext(AppContext);
  const inWishlist = wishlist?.some(item => item._id === p._id);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviews, setShowReviews] = useState(false); 

  const [editForm, setEditForm] = useState({
    name: p.name, price: p.price, image: p.image, category: p.category || 'luxury',
    variantsText: p.variants ? p.variants.map(v => `${v.color}|${v.image}`).join(', ') : ''
  });

  useEffect(() => {
    if (imageUrls.length > 0) {
      setCurrentImage(imageUrls[0]);
    } else if (p.variants && p.variants.length > 0 && p.variants[0].image) {
      setCurrentImage(p.variants[0].image);
    } else {
      setCurrentImage('/images/placeholder.jpg');
    }
  }, [p]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/auth');
    if (!selectedSize) {
      alert("Please select your shoe size before adding to cart!");
      return;
    }
    try {
      const res = await fetchAPI('/cart', { method: 'POST', body: JSON.stringify({ action: 'add', productId: p._id, size: selectedSize }) });
      setCart(res.cart);
      alert(`Added size ${selectedSize} to your cart!`);
    } catch (err) { alert("Error adding to cart"); }
  };

  const handleToggleWishlist = async () => {
    if (!user) return navigate('/auth');
    try {
      const action = inWishlist ? 'remove' : 'add';
      const res = await fetchAPI('/wishlist', { method: 'POST', body: JSON.stringify({ action, productId: p._id }) });
      setWishlist(res.wishlist);
    } catch (err) { alert("Error updating wishlist"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const variantsArray = editForm.variantsText ? editForm.variantsText.split(',').map(v => {
          const parts = v.split('|');
          return { color: parts[0]?.trim(), image: parts[1]?.trim() };
      }).filter(v => v.color && v.image) : [];

      await fetchAPI(`/products/${p._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editForm, price: Number(editForm.price), variants: variantsArray })
      });
      setIsEditing(false);
      fetchProducts();
    } catch (err) { alert("Failed to update"); }
  };

 return (
    <div className="group relative">
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      {showReviews && <ProductReviewsModal p={p} user={user} onClose={() => setShowReviews(false)} />}

      {!isEditing && (
        <button onClick={handleToggleWishlist} className="absolute top-2 left-2 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-stone-400">
          <Heart size={18} className={inWishlist ? "fill-red-500 text-red-500" : "hover:text-red-500"} />
        </button>
      )}

      {user?.role === 'admin' && !isEditing && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 bg-white/70 p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="text-stone-500 hover:text-stone-900 p-1"><Pencil size={16} strokeWidth={1.5}/></button>
          <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-700 p-1"><Trash2 size={16} strokeWidth={1.5}/></button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="border border-stone-200 p-4 space-y-3 bg-white">
          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-2 text-sm" required/>
          <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full border p-2 text-sm" required/>
          <input type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full border p-2 text-sm" required/>
          <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border p-2 text-sm" required/>
          <input type="text" value={editForm.variantsText} onChange={e => setEditForm({...editForm, variantsText: e.target.value})} className="w-full border p-2 text-sm" placeholder="color|image_url, color|image_url"/>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-stone-900 text-white py-2 text-xs uppercase"><Check size={14} className="inline mr-1"/>Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-stone-100 text-stone-600 py-2 text-xs uppercase"><X size={14} className="inline mr-1"/>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {/* Visual card content wrapped inside a Link route handler */}
          <Link to={`/product/${p._id}`} className="block group cursor-pointer text-left">
            {/* 1. FIXED IMAGE FRAME AND OBJECT-COVER APPLIED FOR BIGGER STRUCTURE LOOK */}
            <div className="w-full h-[180px] sm:h-[240px] md:h-[350px] lg:h-[400px] mb-3 relative flex items-center justify-center bg-stone-50 overflow-hidden">
              <img 
                src={currentImage || '/images/placeholder.jpg'} 
                alt={p.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                onError={(e) => { e.target.src = '/images/home/catalogues/kitten/kitten.jpg'; }} 
              />
            </div>
            
            <div className="text-left px-1 sm:px-0">
              <div className="mt-2">
                <h3 className="text-xs sm:text-base font-semibold text-stone-900 uppercase tracking-wider truncate">
                  {p.name.split(/(?=[a-z])/)[0]?.trim()}
                </h3>
                
                <p className="text-[11px] sm:text-sm text-stone-500 font-medium tracking-wide mt-0.5 mb-2 truncate">
                  {p.name.split(/(?=[a-z])/).slice(1).join('').trim()}
                </p>
                
                <p className="text-stone-950 font-semibold text-sm sm:text-base mb-2">
                  Rs {isNaN(Number(p.price)) ? p.price : Number(p.price).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </Link>

          {/* Action container items sit outside the link wrapper to avoid interface collisions */}
          <div className="text-left px-1 sm:px-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 mb-3">
               <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="border border-stone-200 text-[11px] sm:text-xs p-2 bg-white text-stone-600 focus:outline-none flex-grow rounded-none">
                  <option value="">Size (EU)</option>
                  <option value="36">36</option>
                  <option value="37">37</option>
                  <option value="38">38</option>
                  <option value="39">39</option>
                  <option value="40">40</option>
                  <option value="41">41</option>
               </select>
               <button onClick={handleAddToCart} className="bg-stone-900 text-white px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-colors text-center">
                  Add to Cart
               </button>
            </div>

            <div className="flex justify-between items-center mt-3">
              {p.variants && p.variants.length > 0 ? (
                <div className="flex gap-2">
                  {p.variants.map((variant, idx) => {
                    const colorMap = {
                      'cream': '#fdf6e2',
                      'green': '#3bb87c',
                      'bloody red': '#990000',
                      'silver': '#e0e0e0',
                      'nude': '#e6ba9a',
                      'pista': '#98ff98',
                      'peach': '#ffcba4',
                      'darkest red': '#4a0404',
                      'mixed red and black': 'linear-gradient(135deg, #cc0000 50%, #000000 50%)',
                      'mixed brown and nude': 'linear-gradient(135deg, #5c4033 50%, #e6ba9a 50%)',
                      'polka dots(red ,black )': 'radial-gradient(#000000 20%, transparent 20%) 0 0/6px 6px, radial-gradient(#000000 20%, #cc0000 20%) 3px 3px/6px 6px',
                      'black': '#000000',
                      'white': '#ffffff',
                      'grey': '#808080',
                      'brown': '#5c4033',
                      'maroon': '#800000',
                      'gold': '#ffd900',
                      'blue': '#1e3d59',
                      'skyblue': '#87ceeb',
                      'pink': '#ffb6c1',
                      'tan': '#d2b48c',
                      'cheetah': '#ffb700',
                      'leopard': '#b5651d',
                      'champagne': '#f7e7ce',
                      'rose gold': '#b76e79',
                      'lavender': '#e6e6fa',
                      'mint': '#aaf0d1',
                      'charcoal': '#36454f'
                    };

                    const cleanColorName = variant.color?.toLowerCase().trim();
                    const finalBgColor = colorMap[cleanColorName] || variant.color || '#ccc';
                    const isSelected = currentImage === variant.image;

                    return (
                      <div 
                        key={idx} 
                        onClick={() => variant.image && setCurrentImage(variant.image.trim())} 
                        className={`w-5 h-5 rounded-full shadow-sm cursor-pointer border transition-all ${isSelected ? 'border-stone-900 border-2 scale-110' : 'border-stone-300 hover:scale-105'}`} 
                        style={{ background: finalBgColor }}
                        title={variant.color}
                      />
                    );
                  })}
                </div>
              ) : <div className="h-5" />} 
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowReviews(true)} 
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900"
                >
                  ★ Reviews
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setShowSizeGuide(true)} 
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900"
                >
                  <Ruler size={12} /> Size Guide
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20}/></button>
        <h3 className="text-xl font-light uppercase tracking-widest mb-2 text-center">Size Guide</h3>
        <table className="w-full text-sm text-center mt-4">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400 text-[10px] tracking-widest uppercase">
              <th className="py-2">EU</th><th className="py-2">US</th><th className="py-2">UK</th><th className="py-2">CM</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100"><td className="py-2 font-medium">36</td><td>5.5</td><td>3.5</td><td>23.0</td></tr>
            <tr className="border-b border-stone-100"><td className="py-2 font-medium">37</td><td>6.5</td><td>4.5</td><td>23.5</td></tr>
            <tr className="border-b border-stone-100"><td className="py-2 font-medium">38</td><td>7.5</td><td>5.5</td><td>24.0</td></tr>
            <tr className="border-b border-stone-100"><td className="py-2 font-medium">39</td><td>8.5</td><td>6.5</td><td>24.5</td></tr>
            <tr><td className="py-2 font-medium">40</td><td>9.5</td><td>7.5</td><td>25.0</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductReviewsModal({ p, user, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAPI(`/products/${p._id}/reviews`)
      .then(res => setReviews(res.reviews || []))
      .catch(() => {
        setReviews([
          { _id: 'demo_1', username: 'Ananya S.', rating: 5, comment: 'Absolutely gorgeous heels! The finish shines beautifully under ambient lighting.', image: p.image?.split('|')[0], createdAt: new Date() }
        ]);
      });
  }, [p._id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to submit a review.");
    setLoading(true);

    try {
      const res = await fetchAPI(`/products/${p._id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment, image, username: user.username })
      });
      setReviews(res.reviews || [ { _id: Date.now().toString(), username: user.username, rating, comment, image, createdAt: new Date() }, ...reviews ]);
      setComment('');
      setImage('');
      alert("Thank you for your feedback!");
    } catch (err) {
      setReviews([ { _id: Date.now().toString(), username: user.username || 'Guest Tester', rating, comment, image, createdAt: new Date() }, ...reviews ]);
      setComment('');
      setImage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-2xl no-scrollbar border border-stone-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Guest Journal</span>
          <h3 className="text-xl font-light uppercase tracking-widest text-stone-900">Product Reviews</h3>
          <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">{p.name}</p>
        </div>

        {user ? (
          <form onSubmit={handleSubmitReview} className="mb-8 bg-stone-50 p-4 border border-stone-200/60 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-stone-900 font-semibold">Share Your Experience</h4>
            
            <div className="flex gap-4 items-center">
              <label className="text-[11px] uppercase tracking-widest text-stone-500">Rating:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="text-sm focus:outline-none">
                    <span className={star <= rating ? "text-amber-500" : "text-stone-300"}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="How did the fit feel? Describe your stride..." 
                className="w-full bg-white border border-stone-200 p-3 text-xs focus:outline-none focus:border-stone-900 h-20 resize-none"
                required 
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" id="review-img-upload" onChange={handleImageChange} className="hidden" />
                <label htmlFor="review-img-upload" className="border border-stone-300 px-3 py-1.5 text-[10px] uppercase tracking-widest cursor-pointer bg-white hover:border-stone-900 text-stone-600 transition-colors">
                  Upload Photo
                </label>
                {image && (
                  <div className="w-10 h-10 border border-stone-200 overflow-hidden relative">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="bg-stone-900 text-white px-6 py-2 text-[11px] uppercase tracking-widest hover:bg-stone-800 disabled:bg-stone-400 transition-colors">
                {loading ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-stone-500 text-center mb-6 py-2 border border-dashed border-stone-200">
            Please log in to leave a review for these luxury footwear choices.
          </p>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-stone-400 text-xs text-center py-4">No reviews posted yet for this layout variant.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border-b border-stone-100 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">{rev.username}</h5>
                    <div className="text-amber-500 text-xs mt-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                      {Array.from({ length: 5 - rev.rating }).map((_, i) => <span key={i} className="text-stone-200">★</span>)}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed italic">"{rev.comment}"</p>
                {rev.image && (
                  <div className="mt-3 w-20 h-24 bg-stone-50 border border-stone-100 rounded-sm overflow-hidden flex items-center justify-center">
                    <img src={rev.image} alt="User upload" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}