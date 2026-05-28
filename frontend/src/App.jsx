import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Trash2, Pencil, X, Check, Heart, Menu, Ruler, Eye, EyeOff, LogOut } from 'lucide-react';

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
  const imageUrls = p.image ? p.image.split('|').map(url => url.trim()).filter(Boolean) : [];
  const [currentImage, setCurrentImage] = useState('');
  const { wishlist, setWishlist } = useContext(AppContext);
  const inWishlist = wishlist?.some(item => item._id === p._id);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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
          <div className="bg-stone-100 aspect-[4/5] mb-4 overflow-hidden relative">
            <img src={currentImage || '/images/placeholder.jpg'} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = '/images/home/catalogues/kitten/kitten.jpg'; }} />
          </div>
          <div>
            <div>
  {/* Line 1: Main Title (Everything in ALL CAPS) */}
  <h3 className="text-base font-semibold text-stone-950 uppercase tracking-wider">
    {p.name.split(/(?=[a-z])/)[0]?.trim()}
  </h3>
  
  {/* Line 2: Subtitle Description (The rest of the text) */}
  <p className="text-xs text-stone-500 font-light mt-0.5 italic">
    {p.name.split(/(?=[a-z])/).slice(1).join('').trim()}
  </p>
</div>
<p className="text-stone-500 mb-3">
  Rs {typeof p.price === 'number' ? p.price.toLocaleString('en-IN') : p.price}
</p>
            
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
                  {p.variants.map((variant, idx) => {
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
                      'polka dots(red ,black )': 'radial-gradient(#000000 20%, transparent 20%) 0 0/6px 6px, radial-gradient(#000000 20%, #cc0000 20%) 3px 3px/6px 6px',
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
              <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900"><Ruler size={12} /> Size Guide</button>
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

function Auth() {
  const [authMethod, setAuthMethod] = useState('username');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const { setUser, setCart, setWishlist } = useContext(AppContext);
  const navigate = useNavigate();

  const handleUsernameAuth = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(username.trim())) {
        alert("Registration Restricted: You must register using a valid @gmail.com address.");
        return;
      }
    }
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await fetchAPI(endpoint, { method: 'POST', body: JSON.stringify({ username, password }) });
      saveSession(res);
    } catch (err) { alert(err.message || "Authentication failed"); }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone) return alert("Please enter your phone number");
    try {
      const res = await fetchAPI('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
      setOtpSent(true);
      alert(`OTP Sent! (For testing, your code is: ${res.debugOtp})`);
    } catch (err) { alert("Failed to send OTP"); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code: otpCode }) });
      saveSession(res);
    } catch (err) { alert("Invalid OTP code. Try again."); }
  };

  const saveSession = (res) => {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user_details', JSON.stringify(res.user));
    setUser(res.user);
    setCart(res.user.cart || []);
    setWishlist(res.user.wishlist || []);
    alert("Logged in successfully!");
    navigate('/');
  };

  return (
    <div className="bg-white border border-stone-200 p-8 shadow-sm">
      <div className="flex border-b border-stone-200 mb-6 text-xs uppercase tracking-widest font-medium">
        <button type="button" onClick={() => { setAuthMethod('username'); setOtpSent(false); }} className={`flex-1 pb-3 text-center ${authMethod === 'username' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-400'}`}>
          Username Login
        </button>
        <button type="button" onClick={() => setAuthMethod('phone')} className={`flex-1 pb-3 text-center ${authMethod === 'phone' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-400'}`}>
          Phone OTP Login
        </button>
      </div>

      {authMethod === 'username' ? (
        <form onSubmit={handleUsernameAuth} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Username / Gmail</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname@gmail.com" className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" required />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-stone-200 p-3 pr-10 text-sm focus:outline-none focus:border-stone-900" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors">
            {isLogin ? "Sign In" : "Register"}
          </button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[11px] text-stone-400 hover:text-stone-900 underline underline-offset-4">
              {isLogin ? "Need an account? Sign up here" : "Have an account? Log in here"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Mobile Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter mobile number" className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" required />
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors">
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Enter 6-Digit OTP</label>
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6} placeholder="000000" className="w-full border border-stone-200 p-3 text-center text-lg tracking-widest focus:outline-none focus:border-stone-900 font-mono" required />
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors">
                Verify & Log In
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="block mx-auto text-[10px] text-stone-400 hover:text-stone-900 uppercase tracking-wider">
                ← Change Number
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Cart() { return <div className="text-center py-12 text-stone-600 uppercase tracking-wider">Shopping Cart Loaded</div>; }
function Wishlist() { return <div className="text-center py-12 text-stone-600 uppercase tracking-wider">Wishlist Loaded</div>; }

function Admin() {
  const [data, setData] = useState({ users: [], logs: [], productCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', image: '', category: 'luxury', variantsText: ''
  });

  useEffect(() => { refreshDashboard(); }, []);

  const refreshDashboard = () => {
    fetchAPI('/admin')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Admin data fetch error:", err);
        setError(err.message || "Failed to load dashboard data.");
        setLoading(false);
      });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const variantsArray = newProduct.variantsText ? newProduct.variantsText.split(',').map(v => {
        const parts = v.split('|');
        return { color: parts[0]?.trim(), image: parts[1]?.trim() };
      }).filter(v => v.color && v.image) : [];

      await fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          variants: variantsArray
        })
      });

      alert("Product successfully added to the catalog!");
      setNewProduct({ name: '', price: '', image: '', category: 'luxury', variantsText: '' });
      refreshDashboard();
    } catch (err) {
      alert("Failed to create product setup profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 max-w-md mx-auto px-4">
        <p className="text-red-600 font-medium mb-4">⚠️ Access Denied or Error</p>
        <p className="text-stone-500 text-sm mb-6">{error}</p>
        <p className="text-xs text-stone-400">Make sure your current account has an 'admin' role assigned in MongoDB.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="border-b border-stone-200 pb-6">
        <h2 className="text-3xl font-light uppercase tracking-widest text-stone-900">Management Panel</h2>
        <p className="text-stone-400 text-xs uppercase tracking-wider mt-2">Active Products Counter: {data.productCount}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-stone-50 p-8 border border-stone-200">
          <h3 className="text-sm font-medium uppercase tracking-widest text-stone-900 mb-6">Add New Catalogue Entry</h3>
          <form onSubmit={handleCreateProduct} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Item Designation</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-white border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Price Value (INR)</label>
              <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-white border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Root Image Path</label>
              <input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="/images/home/catalogues/..." className="w-full bg-white border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Active Category Section</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900">
                <option value="bellis">Bellis</option>
                <option value="stiletto">Stiletto</option>
                <option value="wedges">Wedges</option>
                <option value="platform">Platform</option>
                <option value="kitten">Kitten</option>
                <option value="luxury">Trending / Luxury</option>
                <option value="summer">Summer Special</option>
                <option value="casual">Casual Wear</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2">Color Matrix Variants String</label>
              <input type="text" value={newProduct.variantsText} onChange={e => setNewProduct({...newProduct, variantsText: e.target.value})} placeholder="black|/images/img1.jpg, gold|/images/img2.jpg" className="w-full bg-white border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <button type="submit" className="w-full bg-stone-900 text-white py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors">Commit Entry</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-stone-200 p-6">
            <h3 className="text-sm font-medium uppercase tracking-widest text-stone-900 mb-4">System Access Profiles ({data.users?.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                    <th className="pb-3">Identity Contact</th><th className="pb-3">Assigned Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.users?.map((u, idx) => (
                    <tr key={idx}><td className="py-3 font-medium text-stone-800">{u.username || u.phone}</td><td className="py-3 uppercase text-stone-500">{u.role}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}