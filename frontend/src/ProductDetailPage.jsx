import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from './App.jsx'; // Explicitly adding .jsx extension fixes Vercel bundling issues

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Extracting products directly from context
  const { products } = useContext(AppContext);
  
  // Find the unique item matching the URL parameter
  const product = products?.find((p) => p._id === id);

  // Image viewer state tracker
  const [activeImage, setActiveImage] = useState('');

  // Extract all available images (handles both arrays and pipe-separated strings)
  const getImageList = () => {
    if (!product) return [];
    if (!product.image) return [];
    
    // If the image string contains '|', split it into an array of clean URLs
    if (typeof product.image === 'string' && product.image.includes('|')) {
      return product.image.split('|').map(url => url.trim()).filter(Boolean);
    }
    
    // Fallback if it's a single image string
    return [product.image];
  };

  const allImages = getImageList();

  // Set the default hero image when product loads
  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-stone-500 mb-4">Loading luxury footwear details...</p>
        <button onClick={() => navigate(-1)} className="text-stone-900 underline uppercase tracking-widest text-sm">
          Go Back
        </button>
      </div>
    );
  }

  // Formatting product names nicely
  const mainTitle = product.name.split(/(?=[a-z])/)[0]?.trim();
  const subtitle = product.name.split(/(?=[a-z])/).slice(1).join('').trim();

  return (
    <div className="min-h-screen bg-white pt-6 pb-12 text-left">
      {/* Mobile Navigation */}
      <div className="px-4 mb-4 md:hidden">
        <button onClick={() => navigate(-1)} className="text-stone-500 text-xs uppercase tracking-widest flex items-center gap-1">
          ← Back to Collection
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Two-Column Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Image Showcase Arena */}
          <div className="flex flex-col items-center w-full">
            {/* Big Main Display */}
            <div className="w-full bg-stone-50 flex items-center justify-center p-4 border border-stone-100 aspect-square md:h-[500px] overflow-hidden">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain transition-all duration-200"
              />
            </div>

            {/* MODIFICATION 2: Image Strip Selector (Amazon Style) */}
            {allImages.length > 1 && (
              <div className="w-full flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 flex-shrink-0 border bg-stone-50 p-1 transition-all ${
                      activeImage === imgUrl ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Ordering System */}
          <div className="flex flex-col justify-start">
            <span className="text-stone-400 text-xs uppercase tracking-widest font-medium mb-1">
              RAWLES HEELS EXCLUSIVE
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-wider text-stone-900">
              {mainTitle}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-stone-500 font-medium tracking-wide mt-1">
                {subtitle}
              </p>
            )}
            
            <p className="text-stone-950 font-bold text-xl md:text-2xl mt-4 mb-6">
              Rs {isNaN(Number(product.price)) ? product.price : Number(product.price).toLocaleString('en-IN')}
            </p>

            <hr className="border-stone-200 mb-6" />

            <p className="text-stone-600 text-sm leading-relaxed mb-8">
              Handcrafted with exceptional premium luxury detailing. Features custom-molded interior footbeds optimized for incredible comfort and sophisticated styling.
            </p>

            {/* Size Dropdown Picker */}
            <div className="mb-6 max-w-xs">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-700 mb-2">
                Select Size (EU)
              </label>
              <select className="w-full border border-stone-300 bg-white p-3 text-xs tracking-wider uppercase focus:outline-none focus:border-stone-900">
                <option value="">Choose Size</option>
                <option value="36">EU 36</option>
                <option value="37">EU 37</option>
                <option value="38">EU 38</option>
                <option value="39">EU 39</option>
                <option value="40">EU 40</option>
                <option value="41">EU 41</option>
              </select>
            </div>

            {/* Action CTA */}
            <div className="mt-2">
              <button className="w-full bg-stone-900 text-white py-4 text-xs uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors">
                Add To Bag
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;