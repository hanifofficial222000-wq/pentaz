'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // LocalStorage থেকে ফেভারিট ডাটা লোড করা
  useEffect(() => {
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    setFavorites(storedFavs);
  }, []);

  // ফায়ারস্টোর থেকে ফেভারিট প্রোডাক্টগুলো ফেচ করা
  useEffect(() => {
    async function loadFavorites() {
      if (favorites.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const matchedProducts = [];

        querySnapshot.forEach(docSnap => {
          const item = { id: docSnap.id, ...docSnap.data() };
          if (favorites.includes(item.id)) {
            matchedProducts.push(item);
          }
        });

        setFavoriteProducts(matchedProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [favorites]);

  // ফেভারিট থেকে প্রোডাক্ট রিমুভ করার ফাংশন
  const removeFavorite = (id) => {
    const updatedFavs = favorites.filter(favId => favId !== id);
    setFavorites(updatedFavs);
    localStorage.setItem('ayaat_favorites', JSON.stringify(updatedFavs));
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-10 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 text-center text-[16px] font-bold text-[#e63946] border-b border-[#eee]">
        ❤️ আমার পছন্দের তালিকা (Favorites)
      </div>

      <div className="max-w-[600px] mx-auto p-2.5">
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-center py-[50px] text-[#666] text-[14px]">লোড হচ্ছে...</div>
          ) : favorites.length === 0 || favoriteProducts.length === 0 ? (
            <div className="text-center py-[50px] text-[#666] text-[14px]">আপনার পছন্দের তালিকায় কোনো প্রোডাক্ট নেই!</div>
          ) : (
            favoriteProducts.map((item) => {
              const imgUrl = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : (item.imageUrl || item.image || item.img || 'https://via.placeholder.com/200');
              const prodTitle = item.title || item.name || item.productName || 'Product';
              const prodPrice = item.price || item.cost || item.productPrice || '0';
              const prodId = item.id || 'N/A';

              return (
                <div 
                  key={item.id} 
                  onClick={() => router.push(`/product?id=${item.id}`)}
                  className="flex bg-white rounded-[10px] p-2.5 items-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] relative cursor-pointer"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(item.id);
                    }} 
                    className="absolute top-2 right-2 bg-transparent border-none text-[#999] text-[16px] cursor-pointer w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                  <img src={imgUrl} alt={prodTitle} className="w-[70px] h-[70px] object-cover rounded-lg mr-3" />
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-[13px] font-bold text-[#333] mb-1">{prodTitle}</h3>
                    <p className="text-[11px] text-[#777] mb-1">আইডি: {prodId}</p>
                    <div className="text-[#e63946] text-[14px] font-bold">SAR {prodPrice}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
