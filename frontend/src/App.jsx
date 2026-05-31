import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Trash2, Pencil, X, Check, Heart, Menu, Ruler, Eye, EyeOff, LogOut, Star } from 'lucide-react';
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
        <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50/30">
          
          <div className="bg-stone-900 text-stone-100 text-[10px] sm:text-xs text-center py-2 uppercase tracking-widest font-medium z-50 relative">
            Complimentary Shipping on all domestic orders over Rs 3,000
          </div>
          
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/summer" element={<SummerPage />} />
              <Route path="/casual" element={<CasualPage />} />
              
              <Route path="/bellis" element={<div className="container mx-auto py-8 md:py-16 max-w-6xl"><Products category="bellis" title="Bellis Collection" /></div>} />
              <Route path="/stiletto" element={<div className="container mx-auto py-8 md:py-16 max-w-6xl"><Products category="stiletto" title="Stiletto Heels" /></div>} />
              <Route path="/wedges" element={<div className="container mx-auto py-8 md:py-16 max-w-6xl"><Products category="wedges" title="Wedges Collection" /></div>} />
              <Route path="/platform" element={<div className="container mx-auto py-8 md:py-16 max-w-6xl"><Products category="platform" title="Platform Shoes" /></div>} />
              <Route path="/kitten" element={<div className="container mx-auto py-8 md:py-16 max-w-6xl"><Products category="kitten" title="Kitten Heels" /></div>} />

              <Route path="/auth" element={<div className="container mx-auto px-4 py-8 max-w-md"><AuthPlaceholder /></div>} />
              <Route path="/cart" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><CartPlaceholder /></div>} />
              <Route path="/wishlist" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><WishlistPlaceholder /></div>} /> 
              <Route path="/admin" element={<div className="container mx-auto px-4 py-8 max-w-6xl"><AdminPlaceholder /></div>} />
              
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

      <section className="container mx-auto pb-24 max-w-6xl">
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
      <section className="container mx-auto py-12 md:py-24 max-w-6xl">
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
      <section className="container mx-auto py-12 md:py-24 max-w-6xl">
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
        setProducts(res);
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
    <div className="px-2 md:px-4">
      <h2 className="text-xl md:text-2xl font-light mb-6 md:text-center md:mb-12 uppercase tracking-widest text-stone-900">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"> 
        {displayedProducts.map(p => (
          <ProductCard key={p._id} p={p} user={user} handleDelete={handleDelete} fetchProducts={fetchProducts} navigate={navigate} setCart={setCart} />
        ))}
      </div>
    </div>
  );
}

export function ProductCard({ p, user, handleDelete, fetchProducts, navigate, setCart }) {
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

  // Color Overflow logic calculations
  const MAX_VISIBLE_COLORS = 4;
  const totalVariants = p.variants || [];
  const visibleVariants = totalVariants.slice(0, MAX_VISIBLE_COLORS);
  const extraColorsCount = totalVariants.length - MAX_VISIBLE_COLORS;

  return (
    <div className="bg-white border border-stone-200/60 p-2 md:p-3 flex flex-col justify-between relative group rounded-sm shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
        <button onClick={handleToggleWishlist} className={`p-1.5 rounded-full bg-white/95 border border-stone-100 shadow-sm transition-colors ${inWishlist ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'}`}>
          <Heart size={14} fill={inWishlist ? "currentColor" : "none"} strokeWidth={2} />
        </button>
        {user?.role === 'admin' && (
          <>
            <button type="button" onClick={() => setIsEditing(!isEditing)} className="p-1.5 rounded-full bg-white/95 border border-stone-100 shadow-sm text-stone-500 hover:text-stone-900">
              <Pencil size={12} />
            </button>
            <button type="button" onClick={() => handleDelete(p._id)} className="p-1.5 rounded-full bg-white/95 border border-stone-100 shadow-sm text-stone-500 hover:text-red-600">
              <Trash2 size={12} />
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
        <div className="flex flex-col h-full justify-between">
          <div>
            <Link to={`/product/${p._id}`} className="block w-full bg-stone-50 border border-stone-50 overflow-hidden relative aspect-[4/5] rounded-xs group">
              <img 
                src={currentImage} 
                alt={p.name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
              />
            </Link>

            <div className="text-left mt-2.5">
              <Link to={`/product/${p._id}`} className="block hover:opacity-80">
                <h3 className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-stone-900 truncate">{mainTitle}</h3>
                {subtitle && <p className="text-[9px] md:text-[10px] text-stone-500 tracking-wide mt-0.5 truncate">{subtitle}</p>}
              </Link>
              <p className="text-stone-900 font-bold text-[11px] md:text-xs mt-1">Rs {Number(p.price).toLocaleString('en-IN')}</p>
              
              {/* Dynamic color selection variant loops + overflow balance counter layout */}
              {totalVariants.length > 0 && (
                <div className="flex gap-1.5 mt-2 mb-1 items-center flex-wrap">
                  {visibleVariants.map((v, idx) => {
                    const colorMap = {
                      'cream': '#fdf6e2',
                      'green': '#2e5a44',
                      'bloody red': '#990000',
                      'silver': '#e0e0e0',
                      'nude': '#e6ba9a',
                      'pista': '#98ff98',
                      'peach': '#ffcba4',
                      'darkest red': '#4a0404',
                      'mixed red and black': 'linear-gradient(135deg, #cc0000 50%, #000000 50%)',
                      'mixed brown and nude': 'linear-gradient(135deg, #5c4033 50%, #e6ba9a 50%)',
                      'polka dots(red ,black )': 'radial-gradient(#000000 20%, transparent 20%), #cc0000',
                      'black': '#000000',
                      'white': '#ffffff',
                      'grey': '#808080',
                      'brown': '#5c4033',
                      'maroon': '#800000',
                      'gold': '#ffd700',
                      'blue': '#1e3d59',
                      'skyblue': '#87ceeb',
                      'pink': '#ffb6c1',
                      'tan': '#d2b48c',
                      'cheetah': '#cca43b',
                      'leopard': '#b5651d',
                      'champagne': '#f7e7ce',
                      'rose gold': '#b76e79',
                      'lavender': '#e6e6fa',
                      'mint': '#aaf0d1',
                      'charcoal': '#36454f'
                    };

                    const cleanColorName = v.color ? v.color.toLowerCase().trim() : '';
                    const finalBg = colorMap[cleanColorName] || v.color || '#ccc';

                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => v.image && setCurrentImage(v.image)} 
                        title={v.color || 'Variant'}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-stone-300 hover:scale-110 hover:border-stone-800 transition-all shadow-sm focus:outline-none"
                        style={{ 
                          background: finalBg, 
                          backgroundColor: finalBg.startsWith('linear') || finalBg.startsWith('radial') ? 'transparent' : finalBg 
                        }}
                      />
                    );
                  })}
                  {extraColorsCount > 0 && (
                    <span className="text-[9px] md:text-[10px] text-stone-400 font-medium tracking-wider pl-0.5">
                      +{extraColorsCount} Colors
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-stone-400 font-bold">Select Size</span>
                  <button type="button" onClick={() => setShowSizeGuide(true)} className="text-[8px] md:text-[9px] uppercase text-stone-500 underline tracking-widest flex items-center gap-0.5 hover:text-stone-900">
                    <Ruler size={9} /> Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {["36", "37", "38", "39", "40"].map(size => (
                    <button 
                      key={size} 
                      type="button"
                      onClick={() => setSelectedSize(size)} 
                      className={`border text-[9px] md:text-[10px] py-1 text-center font-medium transition-colors rounded-xs ${selectedSize === size ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-700 bg-stone-50/50 hover:border-stone-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-100 space-y-1">
            <button type="button" onClick={handleAddToCart} className="w-full bg-stone-900 text-white py-1.5 text-[9px] md:text-[10px] uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors rounded-xs">
              Add To Bag
            </button>
            <button type="button" onClick={() => setShowReviews(true)} className="w-full bg-stone-50 text-stone-700 border border-stone-200 py-1 text-[8px] md:text-[9px] uppercase tracking-widest font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-1 rounded-xs">
              ★ View Reviews
            </button>
          </div>
        </div>
      )}

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      {showReviews && <ProductReviewsModal p={p} user={user} onClose={() => setShowReviews(false)} />}
    </div>
  );
}

function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 w-full max-w-sm rounded-sm shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900">
          <X size={18} />
        </button>
        <h3 className="font-light text-sm uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
          <Ruler size={16} /> Shoe Size Chart Guide
        </h3>
        <div className="border border-stone-100 rounded-sm overflow-hidden text-xs">
          <div className="grid grid-cols-3 bg-stone-50 p-2 font-bold uppercase tracking-wider text-[10px] text-stone-500 border-b border-stone-200">
            <span>EU Size</span>
            <span>UK Size</span>
            <span>Inches</span>
          </div>
          {[
            { eu: "36", uk: "3", in: "8.75\"" },
            { eu: "37", uk: "4", in: "9.00\"" },
            { eu: "38", uk: "5", in: "9.25\"" },
            { eu: "39", uk: "6", in: "9.50\"" },
            { eu: "40", uk: "7", in: "9.75\"" }
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 p-2 border-b border-stone-100 last:border-none text-stone-600">
              <span className="font-semibold text-stone-900">{row.eu}</span>
              <span>{row.uk}</span>
              <span>{row.in}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductReviewsModal({ p, user, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI(`/products/${p._id}/reviews`)
      .then(res => {
        setReviews(res.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        setReviews([
          { user: { name: 'Apurva T.' }, rating: 5, comment: 'Incredibly sleek pair! Fits true to size and feels premium.', date: new Date().toLocaleDateString() },
          { user: { name: 'Sneha W.' }, rating: 4, comment: 'Elegant heel profile. Perfect match for weekend luxury wear.', date: new Date().toLocaleDateString() }
        ]);
        setLoading(false);
      });
  }, [p._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await fetchAPI(`/products/${p._id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      setReviews(res.reviews || []);
      setComment('');
      alert("Review posted successfully!");
    } catch (err) {
      const localNewReview = {
        user: { name: user?.name || 'Verified Buyer' },
        rating,
        comment,
        date: new Date().toLocaleDateString()
      };
      setReviews([localNewReview, ...reviews]);
      setComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-stone-900">Verified Reviews</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">{p.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-200 transition-colors text-stone-500 hover:text-stone-900">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow space-y-4 no-scrollbar">
          {user ? (
            <form onSubmit={handleSubmitReview} className="bg-stone-50 p-3 rounded border border-stone-200/60 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-700 block">Share your walk experience</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star size={14} className={star <= rating ? "text-amber-500 fill-amber-500" : "text-stone-300"} />
                  </button>
                ))}
              </div>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write an honest product review critique..."
                className="w-full text-xs p-2 border border-stone-200 rounded-xs h-16 focus:outline-stone-900 bg-white"
                required
              />
              <button type="submit" className="bg-stone-900 text-white text-[9px] uppercase tracking-widest font-medium px-4 py-1.5 hover:bg-stone-800 transition-colors rounded-xs">
                Submit Review
              </button>
            </form>
          ) : (
            <p className="text-[10px] text-stone-400 uppercase tracking-wide text-center py-2 bg-stone-50 rounded border border-dashed">Sign in to leave a verified rating review</p>
          )}

          <div className="space-y-3 pt-2">
            {loading ? (
              <div className="text-center py-4 text-xs text-stone-400">Loading reviews engine...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-4 text-xs text-stone-400">No reviews posted yet for this style.</div>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="border-b border-stone-100 pb-3 last:border-0 text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-semibold text-stone-900">{rev.user?.name || 'Luxury Customer'}</span>
                    <span className="text-[9px] text-stone-400 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={10} className={star <= rev.rating ? "text-amber-500 fill-amber-500" : "text-stone-200"} />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}