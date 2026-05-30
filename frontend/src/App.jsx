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

export const AppContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Track provided product records globally to handle deep links seamlessly
  const [products, setProducts] = useState([]);

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
    
    // Seed initial product states directly from the backend API
    fetchAPI('/products')
      .then(setProducts)
      .catch(err => console.error("Global products pre-fetch caught error", err));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_details');
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  return (
    <AppContext.Provider value={{ user, setUser, cart, setCart, wishlist, setWishlist, logout, products, setProducts }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans text-stone-800">
          
          <div className="bg-stone-900 text-stone-100 text-[10px] sm:text-xs text-center py-2 uppercase tracking-widest font-medium z-50 relative">
            Complimentary Shipping on all domestic orders over Rs 3,000
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

              <Route path="/auth" element={<div className="container mx-auto px-4 py-8 max-w-md"><AuthPlaceholder /></div>} />
              <Route path="/cart" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><CartPlaceholder /></div>} />
              <Route path="/wishlist" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><WishlistPlaceholder /></div>} /> 
              <Route path="/admin" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><AdminPlaceholder /></div>} />
              
              {/* MODIFICATION 1: Individual Standalone Product Deep Link Path */}
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

// Minimalistic interface routing view placeholders
function AuthPlaceholder() { return <div className="text-center py-12 text-stone-400 uppercase text-xs tracking-widest">Authentication Interface Console</div>; }
function CartPlaceholder() { return <div className="text-center py-12 text-stone-400 uppercase text-xs tracking-widest">Shopping Bag System</div>; }
function WishlistPlaceholder() { return <div className="text-center py-12 text-stone-400 uppercase text-xs tracking-widest">Saved Items Vault</div>; }
function AdminPlaceholder() { return <div className="text-center py-12 text-stone-400 uppercase text-xs tracking-widest">Management Administrator Dash</div>; }

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
  const { setProducts } = useContext(AppContext);
  const [localProducts, setLocalProducts] = useState([]);
  const { user, setCart } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, []);
  
  const fetchProducts = () => { 
    fetchAPI('/products')
      .then(res => {
        setLocalProducts(res);
        setProducts(res); // Synchronize state globally for the detailed deep link routes
      })
      .catch(console.error); 
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetchAPI(`/products/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) { alert("Failed to delete"); }
  };

  const displayedProducts = localProducts.filter(p => (p.category || 'luxury') === category);

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

  const mainTitle = p.name.split(/(?=[a-z])/)[0]?.trim();
  const subtitle = p.name.split(/(?=[a-z])/).slice(1).join('').trim();

  return (
    <div className="bg-white border border-stone-100 p-2 flex flex-col justify-between relative group shadow-sm hover:shadow-md transition-shadow">
      {/* Absolute Header Overlay Icons */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
        <button onClick={handleToggleWishlist} className={`p-1.5 rounded-full bg-white/90 border border-stone-100 shadow-sm transition-colors ${inWishlist ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'}`}>
          <Heart size={15} fill={inWishlist ? "currentColor" : "none"} strokeWidth={2} />
        </button>
        {user?.role === 'admin' && (
          <>
            <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 rounded-full bg-white/90 border border-stone-100 shadow-sm text-stone-500 hover:text-stone-900">
              <Pencil size={13} />
            </button>
            <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-full bg-white/90 border border-stone-100 shadow-sm text-stone-500 hover:text-red-600">
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="text-left space-y-2 p-1 z-20 bg-white">
          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-1 text-xs" placeholder="Product Name" required />
          <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full border p-1 text-xs" placeholder="Price (INR)" required />
          <input type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full border p-1 text-xs" placeholder="Images (Pipe | Separated)" />
          <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border p-1 text-xs">
            <option value="luxury">Trending Arrivals</option>
            <option value="bellis">Bellis</option>
            <option value="stiletto">Stiletto</option>
            <option value="wedges">Wedges</option>
            <option value="platform">Platform</option>
            <option value="kitten">Kitten</option>
            <option value="summer">Summer Special</option>
            <option value="casual">Casual Wear</option>
          </select>
          <textarea value={editForm.variantsText} onChange={e => setEditForm({...editForm, variantsText: e.target.value})} className="w-full border p-1 text-xs h-12" placeholder="Variants (Color|Image, Color|Image)" />
          <div className="flex gap-1 pt-1">
            <button type="submit" className="bg-stone-900 text-white px-2 py-1 text-[10px] uppercase flex-1">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-stone-200 text-stone-800 px-2 py-1 text-[10px] uppercase flex-1">Cancel</button>
          </div>
        </form>
      ) : (
        <><Link to={`/product/${p._id}`} className="block w-full bg-stone-50 border border-stone-50 overflow-hidden relative aspect-square group">
            <img 
              src={currentImage} 
              alt={p.name} 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
            />
          </link>
          {/* Text and Controls Blocks */}
          <div className="text-left mt-3 flex-grow flex flex-col justify-between">
            <div>
              <Link to={`/product/${p._id}`} className="block group-hover:opacity-80">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 truncate">{mainTitle}</h3>
                {subtitle && <p className="text-[10px] text-stone-500 tracking-wide mt-0.5 truncate">{subtitle}</p>}
              </Link>
              <p className="text-stone-900 font-bold text-xs mt-1">Rs {Number(p.price).toLocaleString('en-IN')}</p>
              
              {p.variants && p.variants.length > 0 && (
                <div className="flex gap-1 mt-2 mb-1 overflow-x-auto no-scrollbar">
                  {p.variants.map((v, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => v.image && setCurrentImage(v.image)} 
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-stone-100 border border-stone-200 hover:border-stone-800 transition-colors whitespace-nowrap text-stone-600 font-medium scale-95"
                    >
                      {v.color || 'Var'}
                    </button>
                  ))}
                </div>
              )}

              {/* Sizes Box Engine Selector Grid */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold">Select Size</span>
                  <button onClick={() => setShowSizeGuide(true)} className="text-[9px] uppercase text-stone-500 underline tracking-widest flex items-center gap-0.5 hover:text-stone-900">
                    <Ruler size={10} /> Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {["36", "37", "38", "39", "40"].map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)} 
                      className={`border text-[10px] py-1 text-center font-medium transition-colors ${selectedSize === size ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-700 bg-stone-50/50 hover:border-stone-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Core CTA Action Bars */}
            <div className="mt-4 pt-2 border-t border-stone-100/80 space-y-1.5">
              <button onClick={handleAddToCart} className="w-full bg-stone-900 text-white py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors">
                Add To Bag
              </button>
              <button onClick={() => setShowReviews(true)} className="w-full bg-stone-50 text-stone-700 border border-stone-200/80 py-1.5 text-[9px] uppercase tracking-widest font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-1">
                ★ View Reviews
              </button>
            </div>
          </div>
        </>
      )}

      {/* Conditional Modal Displays */}
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      {showReviews && <ProductReviewsModal p={p} user={user} onClose={() => setShowReviews(false)} />}
    </div>
  );
}

// ... SizeGuideModal and rest of the file stays down below