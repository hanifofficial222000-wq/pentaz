'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // ফায়ারবেস ইম্পোর্ট
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

const mainCategories = [
  { id: 'jersey', name: 'জার্সি' },
  { id: 't-shirt', name: 'টি-শার্ট' },
  { id: 'shoes', name: 'জুতো' },
  { id: 'baby', name: 'বেবি কালেকশন' }
];

export default function AyaatShopHome() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [topThinAds, setTopThinAds] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);

  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [currentTopAdIndex, setCurrentTopAdIndex] = useState(0);

  const [showFullScreenPopup, setShowFullScreenPopup] = useState(true);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  // ১. ফায়ারবেস থেকে রিয়েল-টাইম প্রোডাক্ট এবং ব্যানার ফেচ করা
  useEffect(() => {
    // প্রোডাক্ট ফেচ
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
      setFilteredProducts(prodList);
    }, (error) => {
      console.error("Error fetching products: ", error);
    });

    // ব্যানার ফেচ (যদি ফায়ারবেসে 'banners' কালেকশন থাকে)
    const fetchBanners = async () => {
      try {
        const bannerSnap = await getDocs(collection(db, 'banners'));
        if (!bannerSnap.empty) {
          setPromoBanners(bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          // ডিফল্ট ফলব্যাক ব্যানার যদি ডেটাবেস খালি থাকে
          setPromoBanners([{ id: 1, imageUrl: 'https://via.placeholder.com/600x150?text=AYAAT+SHOP+Banner', link: '#' }]);
        }
      } catch (err) {
        console.error("Banner fetch error:", err);
      }
    };

    // টপ অ্যাডস ফেচ (যদি ফায়ারবেসে 'topAds' কালেকশন থাকে)
    const fetchTopAds = async () => {
      try {
        const adSnap = await getDocs(collection(db, 'topAds'));
        if (!adSnap.empty) {
          setTopThinAds(adSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setTopThinAds([{ id: 1, imageUrl: 'https://via.placeholder.com/600x60?text=Top+Ad', link: '#' }]);
        }
      } catch (err) {
        console.error("Top Ads fetch error:", err);
      }
    };

    fetchBanners();
    fetchTopAds();

    // লোকাল স্টোরেজ থেকে ফেভরিট ও কার트 লোড
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    const storedCart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    setFavorites(storedFavs);
    setCartCount(storedCart.length);

    return () => unsubscribeProducts();
  }, []);

  // অটো স্লাইড প্রমো ব্যানার
  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoBanners.length);
    }, 3000);
    return () => clearInterval(promoInterval);
  }, [promoBanners]);

  // অটো স্লাইড টপ থিন অ্যাডস
  useEffect(() => {
    if (topThinAds.length <= 1) return;
    const topAdInterval = setInterval(() => {
      setCurrentTopAdIndex((prev) => (prev + 1) % topThinAds.length);
    }, 3500);
    return () => clearInterval(topAdInterval);
  }, [topThinAds]);

  // স্ক্রল করলে নিচের নেভবার হাইড হওয়া
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  // সার্চ এবং ফিল্টার লজিক
  useEffect(() => {
    let result = products.filter(p => p.approved !== false); // অ্যাডমিন প্যানেল থেকে অ্যাপ্রুভড ফিল্টার

    if (activeCategory !== 'all' && activeCategory !== 'special-offers') {
      result = result.filter(p => p.mainCategory?.toLowerCase().trim() === activeCategory);
    }

    if (activeSubFilter === 'bestseller') {
      result = result.filter(p => p.bestseller);
    } else if (activeSubFilter === 'discount') {
      result = result.filter(p => Number(p.discount || 0) >= 50);
    } else if (activeSubFilter === 'coupon') {
      result = result.filter(p => p.coupon);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.title?.toLowerCase().includes(query) ||
          p.id?.toLowerCase().includes(query) ||
          p.productPin?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [activeCategory, activeSubFilter, searchQuery, products]);

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    let updatedFavs = [...favorites];
    const index = updatedFavs.indexOf(productId);
    if (index > -1) {
      updatedFavs.splice(index, 1);
    } else {
      updatedFavs.push(productId);
    }
    setFavorites(updatedFavs);
    localStorage.setItem('ayaat_favorites', JSON.stringify(updatedFavs));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-36 font-sans text-gray-800">
      
      {/* TOP THIN AD SLIDER */}
      {topThinAds.length > 0 && (
        <div className="w-full bg-black overflow-hidden relative z-50">
          <div 
            className="flex transition-transform duration-500 ease-in-out" 
            style={{ transform: `translateX(-${currentTopAdIndex * 100}%)` }}
          >
            {topThinAds.map((ad) => (
              <div key={ad.id} className="min-w-full text-center">
                <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <img src={ad.imageUrl} alt="Top Ad" className="w-full max-h-[60px] object-cover mx-auto" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY BAR */}
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setActiveCategory('all')} 
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-[#e63946] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            সব
          </button>
          <button 
            onClick={() => setActiveCategory('special-offers')} 
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'special-offers' ? 'bg-[#e63946] text-white' : 'bg-pink-100 text-[#e63946]'}`}
          >
            🔥 স্পেশাল অফার
          </button>
          {mainCategories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-[#e63946] text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* SEARCH BOX */}
      <div className="p-3 max-w-xl mx-auto">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 প্রোডাক্টের নাম বা আইডি দিয়ে খুঁজুন..." 
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none shadow-sm focus:ring-2 focus:ring-[#e63946]"
        />
      </div>

      {/* PROMO BANNER SECTION */}
      {promoBanners.length > 0 && (
        <div className="p-3 max-w-xl mx-auto">
          <div className="relative w-full h-[130px] rounded-xl overflow-hidden shadow-md">
            <div 
              className="flex h-full transition-transform duration-400 ease-in-out"
              style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}
            >
              {promoBanners.map((banner) => (
                <div key={banner.id} className="min-w-full h-full">
                  <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer">
                    <img src={banner.imageUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                  </a>
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1 bg-black/30 px-2 py-1 rounded-full">
              {promoBanners.map((_, idx) => (
                <span 
                  key={idx} 
                  onClick={() => setCurrentPromoIndex(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${currentPromoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-FILTER BAR */}
      <div className="p-3 max-w-xl mx-auto">
        <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          {[
            { id: 'all', label: 'সকল প্রোডাক্ট' },
            { id: 'bestseller', label: '🔥 সেরা বিকশিত' },
            { id: 'discount', label: '🏷️ ৫০% বা তার বেশি ছাড়' },
            { id: 'coupon', label: '🎟️ কুপন সহ' }
          ].map((chip) => (
            <button 
              key={chip.id}
              onClick={() => setActiveSubFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${activeSubFilter === chip.id ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-xl mx-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 font-bold text-gray-500">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredProducts.map((item) => {
              const isFav = favorites.includes(item.id);
              const mainImg = item.imageUrls?.[0] || 'https://via.placeholder.com/300?text=No+Image';
              return (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col shadow-sm relative">
                  <div className="relative w-full h-[140px] bg-gray-100 overflow-hidden cursor-pointer">
                    {item.discount && Number(item.discount) > 0 && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                        {item.discount}% ছাড়
                      </span>
                    )}
                    <button 
                      onClick={(e) => toggleFavorite(e, item.id)}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs shadow z-10 transition-transform hover:scale-110 ${isFav ? 'text-[#e63946]' : 'text-gray-400'}`}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex flex-col justify-between flex-grow cursor-pointer">
                    {item.productPin && (
                      <span className="text-[10px] text-[#e63946] font-bold bg-[#ffe5e6] px-1.5 py-0.5 rounded w-max mb-1">
                        📌 {item.productPin}
                      </span>
                    )}
                    <h3 className="text-[11px] font-bold mb-1 line-clamp-2 text-gray-800">{item.title}</h3>
                    <div className="text-[#e63946] text-xs font-bold mt-auto">SAR {item.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WHATSAPP FLOAT */}
      <a 
        href="https://wa.me/8801835302525" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`fixed right-4 bg-[#25D366] text-white w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg z-50 transition-all duration-300 ${isNavHidden ? 'bottom-4' : 'bottom-20'}`}
      >
        💬
      </a>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-2 z-40 shadow-lg transition-transform duration-300 ${isNavHidden ? 'translate-y-full' : 'translate-y-0'}`}>
        <Link href="/" className="flex flex-col items-center text-[#e63946] text-[10px] font-bold">
          🏠 Home
        </Link>
        <Link href="/category" className="flex flex-col items-center text-gray-500 text-[10px] font-bold hover:text-[#e63946]">
          📂 Categories
        </Link>
        <Link href="/my-gifts" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946]">
          🎁 Gift
          <span className="absolute -top-1 right-0 bg-[#e63946] text-white text-[9px] px-1 rounded-full font-bold">{giftCount}</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946]">
          ❤️ Favorites
          <span className="absolute -top-1 right-0 bg-[#e63946] text-white text-[9px] px-1 rounded-full font-bold">{favorites.length}</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946]">
          🛒 Cart
          <span className="absolute -top-1 right-0 bg-[#e63946] text-white text-[9px] px-1 rounded-full font-bold">{cartCount}</span>
        </Link>
        <Link href="/register" className="flex flex-col items-center text-gray-500 text-[10px] font-bold hover:text-[#e63946]">
          👤 Account
        </Link>
      </nav>

    </div>
  );
}
