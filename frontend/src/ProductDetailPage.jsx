import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from './App'; 
import { Ruler } from 'lucide-react'; // Matches your iconic design libraries

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Grabbing the global state
  const { products } = useContext(AppContext);
  
  // Find the matching shoe matching the route parameters
  const product = products?.find((p) => p._id === id);

  // Dynamic Image View Trackers for Modification 2
  const [activeImage, setActiveImage] = useState('');

  // Synchronize state when the component mounts or product changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
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

  // Handle building the image array from strings or variants
  const allImages = [];
  if (product.image) allImages.push(product.image);
  
  // If your database has an image pipe structure or variant paths, pull them here safely
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.image && !allImages.includes(v.image.trim())) {
        allImages.push(v.image.trim());
      }
    });
  }

  const mainTitle = product.name.split(/(?=[a-z])/)[0]?.trim();
  const subtitle = product.name.split(/(?=[a-z])/).slice(1).join('').trim();

  return (
    <div className="min-h-screen bg-white pt-6 pb-12 text-left">
      {/* Mobile Breadcrumb Link */}
      <div className="px-4 mb-4 md:hidden">
        <button onClick={() => navigate(-1)} className="text-stone-500 text-xs uppercase tracking-widest flex items-center gap-1">
          ← Back
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: Product Presentation Engine (Main Image + Thumbnail Strip) */}
          <div className="flex flex-col items-center">
            {/* Large Hero Showcase */}
            <div className="w-full bg-stone-50 flex items-center justify-center p-4 border border-stone-100 aspect-square md:h-[500px] overflow-hidden">
              <img 
                src={activeImage || product.image || '/images/placeholder.jpg'} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain transition-all duration-300"
              />
            </div>

            {/* MODIFICATION 2: Amazon-Style Multi-Image Sliding Selector Strip */}
            {allImages.length > 1 && (
              <div className="w-full flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border bg-stone-50 p-1 transition-all ${
                      activeImage === imgUrl ? 'border-stone-950 ring-1 ring-stone-950' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`View ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Ordering Console Controls */}
          <div className="flex flex-col justify-start mt-4 md:mt-0">
            <span className="text-stone-400 text-xs uppercase tracking-widest font-medium mb-1">
              RAWLES HEELS BRAND COLLECTION
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
              Handcrafted premium luxury footwear design. Made with high-grade, resilient materials optimizing contour support for graceful strides and structural perfection.
            </p>

            {/* Sizes Box Selection */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-700 mb-2">Select Size (EU)</label>
              <div className="grid grid-cols-6 gap-2 max-w-sm">
                {["36", "37", "38", "39", "40", "41"].map((size) => (
                  <button key={size} className="border border-stone-200 py-2.5 text-xs hover:border-stone-900 transition-colors uppercase font-medium bg-white text-stone-800">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Action CTA Buttons */}
            <div className="space-y-3 max-w-md">
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