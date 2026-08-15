'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);

  // LocalStorage থেকে ফেভারিট ডাটা লোড করা
  useEffect(() => {
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    setFavorites(storedFavs);
  }, []);

  // ফেভারিট থেকে আইটেম রিমুভ করার ফাংশন
  const removeFavorite = (index) => {
    const updatedFavs = [...favorites];
    updatedFavs.splice(index, 1);
    setFavorites(updatedFavs);
    localStorage.setItem('ayaat_favorites', JSON.stringify(updatedFavs));
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-12 text-slate-800 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 text-center text-base font-bold text-red-600 border-b border-slate-200 shadow-xs">
        ❤️ আমার পছন্দের তালিকা (Favorites)
      </div>

      <div className="max-w-[600px] mx-auto p-3">
        
        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs mt-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">
              ❤️
            </div>
            <h3 className="text-base font-bold mb-1 text-slate-800">কোনো পছন্দের প্রোডাক্ট নেই</h3>
            <p className="text-slate-500 text-sm mb-6">আপনার পছন্দের তালিকাটি বর্তমানে খালি রয়েছে।</p>
            <Link href="/" className="inline-block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-xl font-bold text-sm transition shadow-md">
              শপিং চালিয়ে যান
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {favorites.map((item, index) => {
              // প্রোডাক্ট ম্যানেজমেন্ট কোড অনুযায়ী সঠিক আইডি ও প্রপার্টি ম্যাচিং
              const itemId = item.id || item.productId || item._id;
              const itemTitle = item.title || item.name || 'Product';
              const itemPrice = Number(item.price || 0);
              
              // প্রোডাক্ট ম্যানেজমেন্টে imageUrls অ্যারে অথবা imageUrl সেভ হয়, তা হ্যান্ডেল করার লজিক
              const itemImage = 
                item.imageUrl || 
                (item.imageUrls && item.imageUrls[0]) || 
                item.image || 
                'https://via.placeholder.com/100';

              const itemCategory = item.subCategory || item.category || item.mainCategory || '';

              return (
                <div key={index} className="flex bg-white rounded-xl p-3 items-center border border-slate-200 shadow-xs relative gap-3">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFavorite(index)} 
                    className="absolute top-2 right-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>

                  {/* Product Details Link */}
                  <Link href={itemId ? `/product/${itemId}` : '#'} className="flex items-center flex-grow no-underline">
                    <img 
                      src={itemImage} 
                      alt={itemTitle} 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 mr-3 shrink-0 bg-slate-50" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                    />
                    <div className="flex-grow pr-6">
                      <h4 className="text-xs font-bold text-slate-800 mb-1 hover:text-red-600 transition line-clamp-1">{itemTitle}</h4>
                      
                      {itemCategory && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md mb-1">
                          {itemCategory}
                        </span>
                      )}

                      <div className="text-red-600 text-sm font-bold">SAR {itemPrice}</div>
                    </div>
                  </Link>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
