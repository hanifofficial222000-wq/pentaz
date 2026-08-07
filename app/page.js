'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock data replacing Firebase backend
const mockProducts = [
  {
    id: 'prod-1',
    productPin: 'AYT-01',
    title: 'Professional Sports Jersey - Red Edition',
    price: 150,
    discount: 50,
    bestseller: true,
    coupon: true,
    mainCategory: 'jersey',
    imageUrls: ['https://via.placeholder.com/300?text=Jersey+1', 'https://via.placeholder.com/300?text=Jersey+2'],
    approved: true
  },
  {
    id: 'prod-2',
    productPin: 'AYT-02',
    title: 'Breathable Running T-Shirt',
    price: 90,
    discount: 30,
    bestseller: false,
    coupon: false,
    mainCategory: 't-shirt',
    imageUrls: ['https://via.placeholder.com/300?text=Tshirt+1'],
    approved: true
  },
  {
    id: 'prod-3',
    productPin: 'AYT-03',
    title: 'Lightweight Sports Shoes',
    price: 250,
    discount: 60,
    bestseller: true,
    coupon: true,
    mainCategory: 'shoes',
    imageUrls: ['https://via.placeholder.com/300?text=Shoes+1', 'https://via.placeholder.com/300?text=Shoes+2'],
    approved: true
  },
  {
    id: 'prod-4',
    productPin: 'AYT-04',
    title: 'Kids Baby Collection Tracksuit',
    price: 120,
    discount: 40,
    bestseller: false,
    coupon: true,
    mainCategory: 'baby',
    imageUrls: ['https://via.placeholder.com/300?text=Baby+1'],
    approved: true
  }
];

const mainCategories = [
  { id: 'jersey', name: 'জার্সি' },
  { id: 't-shirt', name: 'টি-শার্ট' },
  { id: 'shoes', name: 'জুতো' },
  { id: 'baby', name: 'বেবি কালেকশন' }
];

const promoBanners = [
  { id: 1, imageUrl: 'https://via.placeholder.com/600x150?text=AYAAT+SHOP+Banner+1', link: '#' },
  { id: 2, imageUrl: 'https://via.placeholder.com/600x150?text=AYAAT+SHOP+Banner+2', link: '#' }
];

const topThinAds = [
  { id: 1, imageUrl: 'https://via.placeholder.com/600x60?text=Top+Ad+1', link: '#' },
  { id: 2, imageUrl: 'https://via.placeholder.com/600x60?text=Top+Ad+2', link: '#' }
];

export default function AyaatShopHome() {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
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

  // Load local storage values on mount
  useEffect(() => {
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    const storedCart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    setFavorites(storedFavs);
    setCartCount(storedCart.length);
  }, []);

  // Auto slide promo banners
  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoBanners.length);
    }, 3000);
    return () => clearInterval(promoInterval);
  }, []);

  // Auto slide top thin ads
  useEffect(() => {
    const topAdInterval = setInterval(() => {
      setCurrentTopAdIndex((prev) => (prev + 1) % topThinAds.length);
    }, 3500);
    return () => clearInterval(topAdInterval);
  }, []);

  // Scroll listener for auto-hiding bottom navigation
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

  // Search & Filter Logic
  useEffect(() => {
    let result = products.filter(p => p.approved);

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
          p.title.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.productPin.toLowerCase().includes(query)
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
      <div className="w-full bg-black overflow-hidden relative z-50">
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentTopAdIndex * 100}%)` }}
        >
          {topThinAds.map((ad) => (
            <div key={ad.id} className="min-w-full text-center">
              <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full">
                <img src={ad.imageUrl} alt="Top Ad" className="w-full max-h-[60px] object-cover mx-auto" />
              </a>
            </div>
          ))}
        </div>
      </div>

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

      {/* TOP CATEGORY AUTO SLIDERS */}
      <div className="flex overflow-x-auto gap-3 px-3 py-2 no-scrollbar max-w-xl mx-auto">
        {mainCategories.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => setActiveCategory(cat.id)}
            className="flex-shrink-0 w-[30%] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
          >
            <div className="text-center text-xs font-bold bg-[#e63946] text-white py-1 uppercase">
              {cat.name}
            </div>
            <img src="https://via.placeholder.com/150?text=Category" alt={cat.name} className="w-full h-28 object-cover" />
          </div>
        ))}
      </div>

      {/* PROMO BANNER SECTION */}
      <div className="p-3 max-w-xl mx-auto">
        <div className="relative w-full h-[130px] rounded-xl overflow-hidden shadow-md">
          <div 
            className="flex h-full transition-transform duration-400 ease-in-out"
            style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}
          >
            {promoBanners.map((banner) => (
              <div key={banner.id} className="min-w-full h-full">
                <a href={banner.link} target="_blank" rel="noopener noreferrer">
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

      {/* VIDEO SECTION */}
      <div className="p-3 max-w-xl mx-auto">
        <div className="font-bold mb-2 text-sm text-gray-900">🔥 ট্রেন্ডিং ভিডিও</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {['জার্সি', 'টি-শার্ট', 'জুতো', 'বেবি কালেকশন'].map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-[30%] text-center bg-white p-1 rounded-xl shadow-sm cursor-pointer">
              <div className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                Video {idx + 1}
              </div>
              <p className="text-xs font-bold mt-1 text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

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
              return (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col shadow-sm relative">
                  <div className="relative w-full h-[140px] bg-gray-100 overflow-hidden cursor-pointer">
                    {item.discount && (
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
                    <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex flex-col justify-between flex-grow cursor-pointer">
                    <span className="text-[10px] text-[#e63946] font-bold bg-[#ffe5e6] px-1.5 py-0.5 rounded w-max mb-1">
                      📌 {item.productPin}
                    </span>
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

      {/* FULL SCREEN POPUP MODAL */}
      {showFullScreenPopup && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-white rounded-2xl overflow-hidden shadow-2xl text-center p-4">
            <button 
              onClick={() => setShowFullScreenPopup(false)} 
              className="absolute top-3 right-3 bg-slate-800 text-white w-8 h-8 rounded-full font-bold flex items-center justify-center z-10"
            >
              ✕
            </button>
            <img src="https://via.placeholder.com/400x400?text=Special+Flash+Sale" alt="Popup" className="w-full h-auto rounded-lg mb-2" />
            <h3 className="font-bold text-base mb-1">স্পেশাল ডিসকাউন্ট অফার!</h3>
            <p className="text-xs text-gray-600 mb-3">আজকের অর্ডারেই উপভোগ করুন আকর্ষণীয় ছাড়।</p>
            <button 
              onClick={() => setShowFullScreenPopup(false)} 
              className="bg-[#e63946] text-white text-xs font-bold py-2.5 px-6 rounded-full w-full"
            >
              অফারটি দেখুন
            </button>
          </div>
        </div>
      )}

      {/* FLOATING WIDGET */}
      {showFloatingWidget && !showFullScreenPopup && (
        <div 
          onClick={() => setShowFullScreenPopup(true)} 
          className="fixed bottom-20 right-4 z-40 cursor-pointer animate-bounce"
        >
          <div className="relative w-20 h-20 bg-gradient-to-tr from-[#e63946] to-[#d62828] rounded-full shadow-lg flex flex-col items-center justify-center text-white border-2 border-white">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFloatingWidget(false); }} 
              className="absolute top-0 right-0 bg-slate-800 text-white w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
            >
              ✕
            </button>
            <span className="text-[9px] font-bold leading-tight">FLASH</span>
            <span className="text-xs font-black leading-tight">SALE</span>
            <span className="text-[7px] bg-white text-[#e63946] px-1 rounded-full font-bold mt-0.5">অফার</span>
          </div>
        </div>
      )}

    </div>
  );
}
