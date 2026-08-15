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
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 text-center text-[16px] font-bold text-[#e63946] border-b border-[#eee]">
        ❤️ আমার পছন্দের তালিকা (Favorites)
      </div>

      <div className="max-w-[600px] mx-auto p-2.5">
        
        {favorites.length === 0 ? (
          <div className="bg-white rounded-[10px] p-[30px_15px] text-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] mb-4">
            <div className="w-[70px] h-[70px] bg-[#fff5f5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#e63946] text-[28px]">
              ❤️
            </div>
            <h3 className="text-[16px] mb-1.5 text-[#333]">কোনো পছন্দের প্রোডাক্ট নেই</h3>
            <p className="text-[#666] text-[14px] mb-5">আপনার পছন্দের তালিকাটি বর্তমানে খালি রয়েছে।</p>
            <Link href="/" className="inline-block w-full bg-[#e63946] text-white text-center p-3 rounded-lg no-underline font-bold text-[15px]">
              শপিং চালিয়ে যান
            </Link>
          </div>
        ) : (
          <div>
            {favorites.map((item, index) => {
              // ফায়ারস্টোর আইডি বা যেকোনো প্রপার্টি থেকে আইডি তুলে আনা
              const itemId = item.id || item.productId || item._id;
              const itemTitle = item.title || item.name || item.productName || 'Product';
              const itemPrice = Number(item.price || item.cost || item.rate || 0);
              
              // সব ধরনের ইমেজ প্রপার্টি হ্যান্ডেল করার শক্তিশালী লজিক
              const itemImage = 
                item.image || 
                item.imageUrl || 
                item.img || 
                item.photo || 
                (item.images && item.images[0]) || 
                (item.imageUrls && item.imageUrls[0]) || 
                'https://via.placeholder.com/100';

              const itemCategory = item.category || item.cat || '';

              return (
                <div key={index} className="flex bg-white rounded-[10px] p-2.5 mb-2 items-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] relative gap-2">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFavorite(index)} 
                    className="absolute top-2 right-2 bg-none border-none text-[#999] text-[16px] cursor-pointer z-10 p-1"
                  >
                    ✕
                  </button>

                  {/* Product Details Link - ফায়ারস্টোর আইডি থাকলে সরাসরি `/product/[id]` এ নিয়ে যাবে */}
                  <Link href={itemId ? `/product/${itemId}` : '#'} className="flex items-center flex-grow no-underline">
                    <img 
                      src={itemImage} 
                      alt={itemTitle} 
                      className="w-[70px] h-[70px] object-cover rounded-lg mr-2.5 shrink-0 bg-gray-100" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                    />
                    <div className="flex-grow">
                      <h4 className="text-[13px] font-bold text-[#333] mb-1 hover:text-[#e63946] transition line-clamp-1">{itemTitle}</h4>
                      
                      {itemCategory && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded mb-1">
                          {itemCategory}
                        </span>
                      )}

                      <div className="text-[#e63946] text-[14px] font-bold">SAR {itemPrice}</div>
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
