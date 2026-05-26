import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Trash2, Plus, LogOut, Pencil, X, Check, Heart, Star, Menu, Ruler } from 'lucide-react';

// FIX: Automatically appended /api to match your backend router paths
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://luxury-footwear-app.onrender.com/api';

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
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

const AppContext = createContext();

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Fetch initial profile and sync lists if token exists
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await fetchAPI('/auth/profile');
          setUser(profile.user);
          
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

              <Route path="/auth" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Auth /></div>} />
              <Route path="/cart" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Cart /></div>} />
              <Route path="/wishlist" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Wishlist /></div>} /> 
              <Route path="/admin" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><Admin /></div>} />
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
    { name: 'Bellis', path: '/bellis', image: '/images/home/catalogues/bellis.jpg' },
    { name: 'Stiletto', path: '/stiletto', image: '/images/home/catalogues/stiletto.jpg' },
    { name: 'Wedges', path: '/wedges', image: '/images/home/catalogues/wedges.jpg' },
    { name: 'Platform', path: '/platform', image: '/images/home/catalogues/platform.jpg' },
    { name: 'Kitten', path: '/kitten', image: '/images/home/catalogues/kitten.jpg' }
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

      <section className="bg-stone-800 text-stone-100 py-24 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-stone-400 uppercase tracking-widest text-sm mb-4">Coming Soon</p>
          <h2 className="text-3xl md:text-4xl font-light mb-6 uppercase tracking-widest">The Autumn '26 Silhouette</h2>
          <p className="text-stone-400 mb-10">We are crafting something special. Pre-orders open next month. Drop your email to get early access before they sell out.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="flex-grow bg-transparent border-b border-stone-500 p-3 text-white focus:outline-none focus:border-white transition-colors" />
            <button className="bg-white text-stone-900 px-6 uppercase tracking-widest text-xs font-bold hover:bg-stone-200">Notify Me</button>
          </div>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {displayedProducts.map(p => (
          <ProductCard key={p._id} p={p} user={user} handleDelete={handleDelete} fetchProducts={fetchProducts} navigate={navigate} setCart={setCart} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ p, user, handleDelete, fetchProducts, navigate, setCart }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayImage, setDisplayImage] = useState(p.image);
  
  const { wishlist, setWishlist } = useContext(AppContext);
  const inWishlist = wishlist?.some(item => item._id === p._id);

  const [showReviews, setShowReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const [editForm, setEditForm] = useState({
    name: p.name, price: p.price, image: p.image, category: p.category || 'luxury',
    variantsText: p.variants ? p.variants.map(v => `${v.color}|${v.image}`).join(', ') : ''
  });

  useEffect(() => { setDisplayImage(p.image); }, [p.image]);

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/auth');
    try {
      await fetchAPI(`/products/${p._id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, image: reviewImage })
      });
      setReviewComment('');
      setReviewRating(5);
      setReviewImage(''); 
      fetchProducts(); 
    } catch (err) { alert("Failed to post review"); }
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

  const avgRating = p.reviews?.length ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1) : 0;

  return (
    <div className="group relative">
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

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
          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-2 text-sm" placeholder="Name" required/>
          <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full border p-2 text-sm" placeholder="Price" required/>
          <input type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full border p-2 text-sm" placeholder="Main Image Path" required/>
          <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border p-2 text-sm" placeholder="Category (e.g. bellis, stiletto)" required/>
          <input type="text" value={editForm.variantsText} onChange={e => setEditForm({...editForm, variantsText: e.target.value})} className="w-full border p-2 text-sm" placeholder="Color Variants (e.g. green|/images/green.jpg)"/>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-stone-900 text-white py-2 text-xs uppercase"><Check size={14} className="inline mr-1"/>Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-stone-100 text-stone-600 py-2 text-xs uppercase"><X size={14} className="inline mr-1"/>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-stone-100 aspect-[4/5] mb-4 overflow-hidden relative">
            <img src={displayImage} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-start">
            <div className="w-full">
              <h3 className="text-lg font-medium text-stone-800">{p.name}</h3>
              <p className="text-stone-500 mb-3">Rs {p.price}</p>
              
              <div className="flex items-center gap-2 mb-3">
                 <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="border border-stone-200 text-xs p-2.5 bg-white text-stone-600 focus:outline-none flex-grow">
                    <option value="">Select Size (EU)</option>
                    <option value="36">36</option>
                    <option value="37">37</option>
                    <option value="38">38</option>
                    <option value="39">39</option>
                    <option value="40">40</option>
                    <option value="41">41</option>
                 </select>
                 <button onClick={handleAddToCart} className="bg-stone-900 text-white px-4 py-2.5 text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-colors whitespace-nowrap">
                    Add to Cart
                 </button>
              </div>

              <div className="flex justify-between items-center mt-3">
                {p.variants && p.variants.length > 0 ? (
                  <div className="flex gap-2">
                    <div title="Main Color" onClick={() => setDisplayImage(p.image)} className={`w-5 h-5 rounded-full cursor-pointer transition-all ${displayImage === p.image ? 'border-stone-900 border-2 scale-110' : 'border-stone-300 border hover:border-stone-500'}`} style={{ backgroundImage: `url(${p.image})`, backgroundSize: 'cover' }} ></div>
                    {p.variants.map((v, idx) => (
                      <div key={idx} title={v.color} onClick={() => setDisplayImage(v.image)} className={`w-5 h-5 rounded-full shadow-sm cursor-pointer border transition-all ${displayImage === v.image ? 'border-stone-900 border-2 scale-110' : 'border-stone-300 hover:border-stone-500'}`} style={{ backgroundColor: v.color.toLowerCase() }} ></div>
                    ))}
                  </div>
                ) : <div />} 

                <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                  <Ruler size={12} strokeWidth={2} /> Size Guide
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 w-full">
                <button onClick={() => setShowReviews(!showReviews)} className="text-[11px] uppercase tracking-widest text-stone-500 hover:text-stone-900 flex items-center justify-between w-full">
                  <span>Reviews ({p.reviews?.length || 0}) {p.reviews?.length > 0 && `★ ${avgRating}`}</span>
                  <span>{showReviews ? '-' : '+'}</span>
                </button>
                
                {showReviews && (
                  <div className="mt-4 space-y-4">
                    {p.reviews?.length > 0 ? (
                      p.reviews.map((r, i) => (
                        <div key={i} className="bg-stone-50 p-3 text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{r.user}</span>
                            <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                          </div>
                          <p className="text-stone-600 mb-2">{r.comment}</p>
                          {r.image && (
                            <div className="mt-2">
                              <img src={r.image} alt="Customer review" className="w-20 h-20 object-cover border border-stone-200 rounded-sm" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : <p className="text-xs text-stone-400 italic">Be the first to review this.</p>}
                    
                    {user ? (
                      <form onSubmit={handleSubmitReview} className="space-y-2 mt-4 pt-4 border-t border-stone-100">
                        <select value={reviewRating} onChange={e=>setReviewRating(e.target.value)} className="w-full border border-stone-200 p-2 text-xs bg-white text-stone-600">
                          <option value="5">5 Stars - Excellent</option>
                          <option value="4">4 Stars - Very Good</option>
                          <option value="3">3 Stars - Average</option>
                          <option value="2">2 Stars - Poor</option>
                          <option value="1">1 Star - Terrible</option>
                        </select>
                        <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Write your thoughts..." required className="w-full border border-stone-200 p-2 text-xs bg-white focus:outline-none focus:border-stone-900" rows="2"></textarea>
                        <input type="text" value={reviewImage} onChange={e=>setReviewImage(e.target.value)} placeholder="Add a Photo URL (optional)" className="w-full border border-stone-200 p-2 text-xs bg-white focus:outline-none focus:border-stone-900" />
                        <button type="submit" className="w-full bg-stone-900 text-white py-2 text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-colors">Post Review</button>
                      </form>
                    ) : (
                      <p className="text-xs text-stone-400 mt-2">Log in to leave a review.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20}/></button>
        <h3 className="text-xl font-light uppercase tracking-widest mb-2 text-center text-stone-900">Size Guide</h3>
        <p className="text-xs text-stone-500 text-center mb-8 uppercase tracking-wide">Women's Footwear Measurements</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-widest">
                <th className="py-3 font-medium">EU</th>
                <th className="py-3 font-medium">US</th>
                <th className="py-3 font-medium">UK</th>
                <th className="py-3 font-medium">CM (Length)</th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              <tr className="border-b border-stone-100 hover:bg-stone-50"><td className="py-3">36</td><td>5.5</td><td>3.5</td><td>23.0</td></tr>
              <tr className="border-b border-stone-100 hover:bg-stone-50"><td className="py-3">37</td><td>6.5</td><td>4.5</td><td>24.0</td></tr>
              <tr className="border-b border-stone-100 hover:bg-stone-50"><td className="py-3">38</td><td>7.5</td><td>5.5</td><td>24.5</td></tr>
              <tr className="border-b border-stone-100 hover:bg-stone-50"><td className="py-3">39</td><td>8.5</td><td>6.5</td><td>25.5</td></tr>
              <tr className="border-b border-stone-100 hover:bg-stone-50"><td className="py-3">40</td><td>9.5</td><td>7.5</td><td>26.0</td></tr>
              <tr className="hover:bg-stone-50"><td className="py-3">41</td><td>10.5</td><td>8.5</td><td>27.0</td></tr>
            </tbody>
          </table>
        </div>
        <button onClick={onClose} className="w-full mt-8 bg-stone-900 text-white py-3 uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors">Close Guide</button>
      </div>
    </div>
  );
}

function Wishlist() {
  const { user, wishlist, setWishlist, setCart } = useContext(AppContext);
  
  const handleRemove = async (productId) => {
    try {
      const res = await fetchAPI('/wishlist', { method: 'POST', body: JSON.stringify({ action: 'remove', productId }) });
      setWishlist(res.wishlist);
    } catch (err) { alert("Error removing from wishlist"); }
  };

  const handleAddToCart = async (p) => {
    try {
      const res = await fetchAPI('/cart', { method: 'POST', body: JSON.stringify({ action: 'add', productId: p._id, size: '38' }) });
      setCart(res.cart);
      alert("Added to cart!");
    } catch (err) { alert("Error adding to cart"); }
  };

  if (!user) return <div className="text-center py-20">Please log in to view your wishlist.</div>;
  if (wishlist.length === 0) return <div className="text-center py-20 text-stone-500">Your wishlist is empty. Discover something beautiful!</div>;
  
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-light mb-8 uppercase tracking-wide">Your Saved Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {wishlist.map((item, idx) => (
          <div key={idx} className="group relative border border-stone-100 p-4">
             <button onClick={() => handleRemove(item._id)} className="absolute top-2 right-2 z-10 text-stone-400 hover:text-red-500 p-2"><X size={16} /></button>
             <div className="bg-stone-100 aspect-[4/5] mb-4 overflow-hidden">
                <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
             </div>
             <h3 className="font-medium text-stone-800">{item.name}</h3>
             <p className="text-stone-500 mb-4 text-sm">Rs {item.price}</p>
             <button onClick={() => handleAddToCart(item)} className="w-full bg-stone-900 text-white py-2 uppercase text-xs hover:bg-stone-800 transition-colors">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cart() {
  const { user, cart, setCart } = useContext(AppContext);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleRemove = async (productId) => {
    try {
      const res = await fetchAPI('/cart', { method: 'POST', body: JSON.stringify({ action: 'remove', productId }) });
      setCart(res.cart);
    } catch (err) { alert("Error removing item"); }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetchAPI('/checkout', { method: 'POST' });
      alert(res.message || "Checkout successful!");
      setCart([]); 
    } catch (err) { alert("Error during checkout."); }
    setIsCheckingOut(false);
  };

  if (!user) return <div className="text-center py-20">Please log in to view cart.</div>;
  if (cart.length === 0) return <div className="text-center py-20 text-stone-500">Your cart is empty.</div>;
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-light mb-8 uppercase tracking-wide">Your Cart</h2>
      {/* Rest of Cart UI goes here... */}
    </div>
  );
}