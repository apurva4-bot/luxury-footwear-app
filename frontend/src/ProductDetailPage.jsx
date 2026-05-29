import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from './App';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Grabbing your full products array from global state
  const { products } = useContext(AppContext); 
  
  // Find the matching shoe using the ID from the URL link
  const product = products?.find((p) => p._id === id);

  // Safety net: If the product database hasn't loaded yet
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-stone-500 mb-4">Loading product details...</p>
        <button onClick={() => navigate(-1)} className="text-stone-900 underline uppercase tracking-widest text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-6 pb-12">
      {/* Back button for mobile */}
      <div className="px-4 mb-4 md:hidden">
        <button onClick={() => navigate(-1)} className="text-stone-600 text-xs uppercase tracking-widest flex items-center gap-1">
          ← Back to collection
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Amazon-style Layout: 1 Column on Mobile, 2 Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Large Product Image */}
          <div className="w-full bg-stone-50 flex items-center justify-center p-2 rounded-sm border border-stone-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto max-h-[450px] object-contain"
            />
          </div>

          {/* RIGHT COLUMN: Product Context info */}
          <div className="flex flex-col justify-start text-left px-2">
            <span className="text-stone-400 text-xs uppercase tracking-widest font-medium mb-1">
              Luxury Footwear
            </span>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-wider text-stone-900 mb-2">
              {product.name}
            </h1>
            
            <p className="text-stone-950 font-semibold text-xl mb-6">
              Rs {isNaN(Number(product.price)) ? product.price : Number(product.price).toLocaleString('en-IN')}
            </p>

            <hr className="border-stone-100 mb-6" />

            <p className="text-stone-600 text-sm leading-relaxed mb-8">
              Handcrafted precision layout. Experience elite comfort and timeless minimalist fashion with this exclusive addition to our premium collection.
            </p>

            {/* Simple Add to Cart Action */}
            <div className="mt-auto">
              <button className="w-full bg-stone-900 text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-stone-800 transition-colors">
                Add To Cart
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;