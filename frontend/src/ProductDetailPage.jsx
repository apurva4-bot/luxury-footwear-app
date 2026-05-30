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
        <>
          {/* Modification 1 Dynamic Navigation Linked Frame */}
          <Link to={`/product/${p._id}`} className="block w-full bg-stone-50 border border-stone-50 overflow-hidden relative aspect-square group">
            <img 
              src={currentImage} 
              alt={p.name} 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
            />
          </Link>
 
          {/* Text and Controls Blocks */}
          <div className="text-left mt-3 flex-grow flex flex-col justify-between">
            <div>
              <Link to={`/product/${p._id}`} className="block group-hover:opacity-80">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 truncate">{mainTitle}</h3>
                {subtitle && <p className="text-[10px] text-stone-500 tracking-wide mt-0.5 truncate">{subtitle}</p>}
              </Link>
              <p className="text-stone-900 font-bold text-xs mt-1">Rs {Number(p.price).toLocaleString('en-IN')}</p>
              
              {/* RESTORED VISUAL COLOR CIRCLES */}
              {p.variants && p.variants.length > 0 && (
                <div className="flex gap-2 mt-2 mb-1 items-center">
                  {p.variants.map((v, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => v.image && setCurrentImage(v.image)} 
                      title={v.color || 'Variant'}
                      className="w-4 h-4 rounded-full border border-stone-300 hover:scale-110 hover:border-stone-800 transition-all shadow-sm focus:outline-none"
                      style={{ backgroundColor: v.color?.toLowerCase() || '#ccc' }}
                    />
                  ))}
                </div>
              )}

              {/* Sizes Selector Grid Layout - Intact with Guide */}
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
      {showSizeGuide && <div className="text-stone-400 text-xs">Size Guide Opened</div>}
      {showReviews && <div className="text-stone-400 text-xs">Reviews Interface Opened</div>}
    </div>
  );
}