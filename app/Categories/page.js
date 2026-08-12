'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// ১. গ্লোবাল ব্যানার কম্পোনেন্ট (এটি আপনার পুরো প্রজেক্টে শেয়ার করতে পারেন)
export function GlobalBanner({ type = 'top', message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    top: 'bg-[#e63946] text-white py-2 px-4 text-xs font-medium text-center',
    bottom: 'bg-[#333] text-white py-3 px-4 text-xs rounded-xl shadow-md my-4 text-center mx-2.5',
  };

  return (
    <div className={`flex justify-between items-center max-w-[600px] mx-auto ${styles[type] || styles.top}`}>
      <span className="flex-1">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }} 
        className="bg-transparent border-none text-inherit font-bold cursor-pointer text-sm ml-2 p-1"
      >
        ✕
      </button>
    </div>
  );
}

// ২. মূল ফেভারিট পেইজ কম্পোনেন্ট
export default function FavoritesPage({ 
  globalTopBanner = '❤️ আপনার পছন্দের আইটেমগুলোতে চলছে বিশেষ ডিসকাউন্ট অফার!', 
  globalBottomBanner = '📢 আয়াাত শপের নতুন অফার এবং আপডেট পেতে আমাদের সাথেই থাকুন।' 
}) {
  const router = useRouter();

  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopPopup, setShowTopPopup] = useState(true);

  // LocalStorage থেকে ফেভারিট এবং কার্ট ডাটা লোড করা
  useEffect(() => {
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    const storedCart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    
    setFavorites(storedFavs);
    setCart(storedCart);
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
    <div className="bg-[#f8f9fa] min-h-screen pb-[90px] font-sans">
      
      {/* গ্লোবাল টপ ব্যানার বা বিজ্ঞাপন স্লট */}
      {showTopPopup && (
        <GlobalBanner 
          type="top" 
          message={globalTopBanner} 
          onClose={() => setShowTopPopup(false)} 
        />
      )}

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

        {/* গ্লোবাল বটম ব্যানার বা বিজ্ঞাপন স্লট */}
        <GlobalBanner type="bottom" message={globalBottomBanner} />
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#eaeaea] flex justify-around items-center py-2 z-[1000]">
        <Link href="/" className="flex flex-col items-center no-underline text-[#666] text-[11px] font-bold relative">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
        <Link href="/categories" className="flex flex-col items-center no-underline text-[#666] text-[11px] font-bold relative">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Categories
        </Link>
        <Link href="/favorites" className="flex flex-col items-center no-underline text-[#e63946] text-[11px] font-bold relative">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          Favorites
          <span className="absolute -top-[3px] right-1 bg-[#e63946] text-white text-[9px] px-1.5 py-0.2 rounded-[10px] font-bold">{favorites.length}</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center no-underline text-[#666] text-[11px] font-bold relative">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          Cart
          <span className="absolute -top-[3px] right-1 bg-[#e63946] text-white text-[9px] px-1.5 py-0.2 rounded-[10px] font-bold">{cart.length}</span>
        </Link>
        <Link href="/register" className="flex flex-col items-center no-underline text-[#666] text-[11px] font-bold relative">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Account
        </Link>
      </nav>

    </div>
  );
}
