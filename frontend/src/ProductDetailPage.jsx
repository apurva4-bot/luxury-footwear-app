import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from './App';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCart, setWishlist } = useContext(AppContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Production backend link configuration
  const BACKEND_URL = "https://luxury-footwear-app.onrender.com";

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Scanning root products endpoint
        const res = await fetch(`${BACKEND_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to load catalog products.");
        const products = await res.json();
        
        // Locate matching item id
        const foundProduct = products.find(p => p._id === id);
        if (!foundProduct) throw new Error("The requested luxury item could not be located.");
        
        setProduct(foundProduct);
        setActiveImage(foundProduct.image || '');
        
        if (foundProduct.variants && foundProduct.variants.length > 0) {
          setSelectedColor(foundProduct.variants[0].color);
        } else {
          setSelectedColor('Original');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleServerAction = async (targetEndpoint, actionType) => {
    setActionMessage('');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setActionMessage("Please sign in to access your personal collection.");
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/${targetEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: actionType, productId: id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action authorization failed.");

      if (targetEndpoint === 'cart') {
        setCart(data.cart);
        setActionMessage("Item successfully added to your shopping bag.");
      } else {
        setWishlist(data.wishlist);
        setActionMessage("Item safely saved to your private wishlist.");
      }
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'sans-serif', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '11px' }}>
        Loading Curated Details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #eee' }}>
        <p style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>{error || "Item Unavailable"}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '15px', background: '#111', color: '#fff', border: 'none', padding: '10px 20px', textTransform: 'uppercase', fontSize: '10px', cursor: 'pointer' }}>
          Return To Gallery
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#1c1b1b' }}>
      
      {actionMessage && (
        <div style={{ backgroundColor: '#f5f5f4', border: '1px solid #e7e5e4', color: '#444', padding: '12px', marginBottom: '30px', textAlign: 'center', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {actionMessage}
        </div>
      )}

      {/* Modern Clean Responsive CSS Grid System */}
      <div style={{ display: 'grid', gap: '50px' }} className="md:grid-cols-2 grid-cols-1 grid">
        
        {/* Left Column: Visual Assets Display */}
        <div>
          <div style={{ border: '1px solid #f2f0ea', backgroundColor: '#faf9f6', overflow: 'hidden', marginBottom: '15px' }}>
            <img 
              src={activeImage} 
              alt={product.name} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
            />
          </div>
          
          {/* Active Alternate Color Variants Component */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div 
                onClick={() => { setActiveImage(product.image || ''); setSelectedColor('Original'); }}
                style={{ width: '70px', height: '70px', border: activeImage === product.image ? '1px solid #111' : '1px solid #eee', cursor: 'pointer', padding: '2px', backgroundColor: '#faf9f6' }}
              >
                <img src={product.image} alt="original preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {product.variants.map((v, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setActiveImage(v.image || ''); setSelectedColor(v.color || 'Alternative'); }}
                  style={{ width: '70px', height: '70px', border: activeImage === v.image ? '1px solid #111' : '1px solid #eee', cursor: 'pointer', padding: '2px', backgroundColor: '#faf9f6' }}
                >
                  <img src={v.image} alt={v.color} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Selection Options Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            {product.category || 'Luxury Footwear'}
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 15px 0', color: '#1c1b1b' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '18px', color: '#444', margin: '0 0 30px 0', fontFamily: 'serif' }}>
            Rs. {product.price?.toLocaleString('en-IN') || '0.00'}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #f3f2ef', marginBottom: '25px' }} />

          {selectedColor && (
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', marginBottom: '20px' }}>
              Selected Shade: <strong style={{ color: '#111' }}>{selectedColor}</strong>
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <button 
              onClick={() => handleServerAction('cart', 'add')}
              style={{ width: '100%', backgroundColor: '#1c1b1b', color: '#fff', padding: '15px', border: 'none', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add To Cart Bag
            </button>
            <button 
              onClick={() => handleServerAction('wishlist', 'add')}
              style={{ width: '100%', backgroundColor: '#fff', color: '#1c1b1b', padding: '15px', border: '1px solid #1c1b1b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}
            >
              Save To Wishlist Collection
            </button>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>Product Care & Identity</h4>
            <p style={{ fontSize: '12px', color: '#78716c', lineHeight: '1.6', margin: 0 }}>
              Crafted meticulously matching premier high-fashion criteria. Each shoe features carefully selected hardware architectures, comfort-lined inner molding layers, and high-tier premium grading accents built to endure beautiful long-term presentation.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}