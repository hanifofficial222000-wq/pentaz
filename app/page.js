'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

export default function AyaatShopHome() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [topThinAds, setTopThinAds] = useState([]);
  const [fullPageAds, setFullPageAds] = useState([]);
  const [smallPopups, setSmallPopups] = useState([]);
  
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [favorites, setFavorites] = useState([]);

  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [currentTopAdIndex, setCurrentTopAdIndex] = useState(0);

  // স্ক্রল করে নেভবার লুকানোর ও দেখানোর স্টেট
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  // ফুল-পেজ পপআপ ক্লোজ স্টেট
  const [showFullPopupModal, setShowFullPopupModal] = useState(false);
  const [activePopupAd, setActivePopupAd] = useState(null);

  // ড্র্যাগেবল স্মল পপআপ স্টেট
  const [popupPosition, setPopupPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: popupPosition.x,
      initialY: popupPosition.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = dragRef.current.startX - clientX;
    const dy = dragRef.current.startY - clientY;

    setPopupPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTouchMove);
      window.addEventListener('mouseup', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // পেজ স্ক্রল ডিটেকশন
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ফায়ারবেস থেকে প্রোডাক্ট, ক্যাটাগরি ও অ্যাডস ফেচ করা
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
      setFilteredProducts(prodList);
    }, (error) => {
      console.error("Error fetching products: ", error);
    });

    const fetchData = async () => {
      try {
        // ১. মেইন ক্যাটেগরি ফেচ
        const mainCatSnap = await getDocs(collection(db, 'mainCategories'));
        if (!mainCatSnap.empty) {
          setMainCategories(mainCatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        // ২. সাব-ক্যাটেগরি ফেচ
        const subCatSnap = await getDocs(collection(db, 'subCategories'));
        if (!subCatSnap.empty) {
          setSubCategories(subCatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        // ৩. ব্যানার ফেচ
        const bannerSnap = await getDocs(collection(db, 'banners'));
        if (!bannerSnap.empty) {
          const bList = bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => !b.hidden);
          setPromoBanners(bList);
        }

        // ৪. টপ থিন অ্যাডস ফেচ
        const adSnap = await getDocs(collection(db, 'topThinAds'));
        if (!adSnap.empty) {
          const tList = adSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(a => !a.hidden);
          setTopThinAds(tList);
        }

        // ৫. ফুল পেজ অ্যাডস ফেচ
        const fullSnap = await getDocs(collection(db, 'fullPageAds'));
        if (!fullSnap.empty) {
          const fList = fullSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(f => !f.hidden && f.isActive);
          if (fList.length > 0) {
            setActivePopupAd(fList[0]);
            setShowFullPopupModal(true);
          }
        }

        // ৬. স্মল পপআপ ফেচ
        const smallSnap = await getDocs(collection(db, 'smallPopups'));
        if (!smallSnap.empty) {
          setSmallPopups(smallSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(s => !s.hidden));
        }

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();

    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    setFavorites(storedFavs);

    return () => unsubscribeProducts();
  }, []);

  // প্রমো ব্যানার অটো-স্লাইড
  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoBanners.length);
    }, 3000);
    return () => clearInterval(promoInterval);
  }, [promoBanners]);

  // টপ থিন অ্যাডস অটো-স্লাইড
  useEffect(() => {
    if (topThinAds.length <= 1) return;
    const topAdInterval = setInterval(() => {
      setCurrentTopAdIndex((prev) => (prev + 1) % topThinAds.length);
    }, 3500);
    return () => clearInterval(topAdInterval);
  }, [topThinAds]);

  // মেইন ক্যাটেগরি সিলেক্ট হ্যান্ডলার (সাব ক্যাটেগরি রিসেট হবে)
  const handleMainCategoryClick = (catName) => {
    setActiveCategory(catName);
    setActiveSubCategory('all');
  };

  // বর্তমান সিলেক্ট করা মেইন ক্যাটেগরির আন্ডারে থাকা সাব-ক্যাটেগরিগুলো ফিল্টার করা
  const currentSubCategoriesList = subCategories.filter(
    sub => sub.mainCat?.toLowerCase().trim() === activeCategory.toLowerCase().trim()
  );

  // প্রোডাক্ট ফিল্টারিং লজিক
  useEffect(() => {
    let result = products.filter(p => p.approved !== false);

    if (activeCategory === 'special-offers') {
      result = result.filter(p => p.isSpecialOffer || p.category?.toLowerCase() === 'special-offers');
    } else if (activeCategory !== 'all') {
      // মেইন ক্যাটেগরি অনুযায়ী ফিল্টার
      result = result.filter(p => {
        const pMain = (p.mainCategory || p.category || '').toLowerCase().trim();
        return pMain === activeCategory.toLowerCase().trim();
      });

      // সাব-ক্যাটেগরি অনুযায়ী ফিল্টার (যদি নির্দিষ্ট সাব-ক্যাটেগরি সিলেক্ট করা থাকে)
      if (activeSubCategory !== 'all') {
        result = result.filter(p => {
          const pSub = (p.subCategory || p.subcat || '').toLowerCase().trim();
          return pSub === activeSubCategory.toLowerCase().trim();
        });
      }
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
  }, [activeCategory, activeSubCategory, activeSubFilter, searchQuery, products]);

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
    <div className="bg-gray-50 min-h-screen pb-32 font-sans text-gray-800 relative">
      
      {/* FULL PAGE POPUP MODAL */}
      {showFullPopupModal && activePopupAd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden relative shadow-2xl animate-scaleIn">
            <button 
              onClick={() => setShowFullPopupModal(false)}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 cursor-pointer"
            >
              ✕
            </button>
            <a href={activePopupAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block">
              <img src={activePopupAd.imageUrl} alt="Popup Ad" className="w-full h-auto max-h-[400px] object-cover" />
            </a>
            <div className="p-3 text-center bg-gray-50">
              <button 
                onClick={() => setShowFullPopupModal(false)}
                className="bg-[#e63946] text-white px-6 py-2 rounded-xl text-xs font-bold w-full cursor-pointer"
              >
                পাস করুন / বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING & DRAGGABLE SMALL POPUPS */}
      {smallPopups.length > 0 && (
        <div 
          style={{ right: `${popupPosition.x}px`, bottom: `${popupPosition.y}px` }}
          className="fixed z-[9999] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleTouchStart}
          onTouchStart={handleTouchStart}
        >
          {smallPopups.map((popup) => (
            <div key={popup.id} className="relative group">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSmallPopups(prev => prev.filter(item => item.id !== popup.id));
                }}
                className="absolute -top-1 -left-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-20 cursor-pointer hover:scale-110 transition-transform"
              >
                ✕
              </button>
              <a 
                href={popup.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#ff416c] to-[#ff4b2b] shadow-2xl flex items-center justify-center no-underline"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                  <img src={popup.imageUrl} alt="Popup" className="w-full h-full object-cover pointer-events-none" />
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TOP THIN AD SLIDER */}
      {topThinAds.length > 0 && (
        <div className="w-full bg-black overflow-hidden relative z-40">
          <div 
            className="flex transition-transform duration-700 ease-in-out" 
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

      {/* MAIN CATEGORY & SUB-CATEGORY HEADER */}
      <header className={`sticky top-0 bg-white z-30 border-b border-gray-100 shadow-sm transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* মেইন ক্যাটেগরি বার */}
        <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar whitespace-nowrap">
          <button 
            onClick={() => handleMainCategoryClick('all')} 
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeCategory === 'all' ? 'bg-[#e63946] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
          >
            সব
          </button>
          <button 
            onClick={() => handleMainCategoryClick('special-offers')} 
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeCategory === 'special-offers' ? 'bg-[#e63946] text-white shadow-md' : 'bg-pink-100 text-[#e63946]'}`}
          >
            🔥 স্পেশাল অফার
          </button>
          {mainCategories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => handleMainCategoryClick(cat.name)} 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeCategory === cat.name ? 'bg-[#e63946] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* সাব-ক্যাটেগরি বার (যদি বর্তমান মেইন ক্যাটেগরির কোনো সাব-ক্যাটেগরি থাকে) */}
        {currentSubCategoriesList.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveSubCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              সব ({activeCategory})
            </button>
            {currentSubCategoriesList.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubCategory(sub.name)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubCategory === sub.name ? 'bg-[#e63946] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* SEARCH BOX */}
      <div className="p-3 max-w-xl mx-auto">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 প্রোডাক্টের নাম বা আইডি দিয়ে খুঁজুন..." 
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none shadow-sm focus:ring-2 focus:ring-[#e63946] text-black"
        />
      </div>

      {/* PROMO BANNER SECTION */}
      {promoBanners.length > 0 && (
        <div className="p-3 max-w-xl mx-auto">
          <div className="relative w-full h-[130px] rounded-xl overflow-hidden shadow-md">
            <div 
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}
            >
              {promoBanners.map((banner) => (
                <div key={banner.id} className="min-w-full h-full flex-shrink-0">
                  <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={banner.imageUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                  </a>
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1 bg-black/30 px-2 py-1 rounded-full z-10">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${activeSubFilter === chip.id ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
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
              const mainImg = item.imageUrl || item.image || (item.imageUrls && item.imageUrls[0]) || item.img || 'https://via.placeholder.com/300?text=No+Image';
              
              return (
                <Link 
                  href={`/product/${item.id}`} 
                  key={item.id} 
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col shadow-sm relative no-underline hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative w-full h-[140px] bg-gray-100 overflow-hidden">
                    {item.discount && Number(item.discount) > 0 && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                        {item.discount}% ছাড়
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(e, item.id);
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs shadow z-10 transition-transform hover:scale-110 cursor-pointer ${isFav ? 'text-[#e63946]' : 'text-gray-400'}`}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex flex-col justify-between flex-grow">
                    {item.productPin && (
                      <span className="text-[10px] text-[#e63946] font-bold bg-[#ffe5e6] px-1.5 py-0.5 rounded w-max mb-1">
                        📌 {item.productPin}
                      </span>
                    )}
                    <h3 className="text-[11px] font-bold mb-1 line-clamp-2 text-gray-800">{item.title}</h3>
                    <div className="text-[#e63946] text-xs font-bold mt-auto">SAR {item.price || item.discountPrice}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
