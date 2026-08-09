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
  const [isPromoTransitioning, setIsPromoTransitioning] = useState(true);

  const [currentTopAdIndex, setCurrentTopAdIndex] = useState(0);
  const [isTopAdTransitioning, setIsTopAdTransitioning] = useState(true);

  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  const [showFullPopupModal, setShowFullPopupModal] = useState(false);
  const [activePopupAd, setActivePopupAd] = useState(null);

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
        const mainCatSnap = await getDocs(collection(db, 'mainCategories'));
        if (!mainCatSnap.empty) {
          setMainCategories(mainCatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        const subCatSnap = await getDocs(collection(db, 'subCategories'));
        if (!subCatSnap.empty) {
          setSubCategories(subCatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        const bannerSnap = await getDocs(collection(db, 'banners'));
        if (!bannerSnap.empty) {
          const rawBanners = bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => !b.hidden);
          if (rawBanners.length > 0) {
            setPromoBanners([...rawBanners, rawBanners[0]]);
          }
        }

        const adSnap = await getDocs(collection(db, 'topThinAds'));
        if (!adSnap.empty) {
          const rawAds = adSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(a => !a.hidden);
          if (rawAds.length > 0) {
            setTopThinAds([...rawAds, rawAds[0]]);
          }
        }

        const fullSnap = await getDocs(collection(db, 'fullPageAds'));
        if (!fullSnap.empty) {
          const fList = fullSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(f => !f.hidden && f.isActive);
          if (fList.length > 0) {
            setActivePopupAd(fList[0]);
            setShowFullPopupModal(true);
          }
        }

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

  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const originalLength = promoBanners.length - 1;

    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prevIndex) => {
        if (prevIndex === originalLength - 1) {
          setTimeout(() => {
            setIsPromoTransitioning(false);
            setCurrentPromoIndex(0);
          }, 600);
          return prevIndex + 1;
        } else {
          setIsPromoTransitioning(true);
          return prevIndex + 1;
        }
      });
    }, 3000);

    return () => clearInterval(promoInterval);
  }, [promoBanners]);

  useEffect(() => {
    if (topThinAds.length <= 1) return;
    const originalLength = topThinAds.length - 1;

    const topAdInterval = setInterval(() => {
      setCurrentTopAdIndex((prevIndex) => {
        if (prevIndex === originalLength - 1) {
          setTimeout(() => {
            setIsTopAdTransitioning(false);
            setCurrentTopAdIndex(0);
          }, 600);
          return prevIndex + 1;
        } else {
          setIsTopAdTransitioning(true);
          return prevIndex + 1;
        }
      });
    }, 3500);

    return () => clearInterval(topAdInterval);
  }, [topThinAds]);

  const handleMainCategoryClick = (catName) => {
    setActiveCategory(catName);
    setActiveSubCategory('all');
  };

  const currentSubCategoriesList = subCategories.filter(
    sub => sub.mainCat?.toLowerCase().trim() === activeCategory.toLowerCase().trim()
  );

  useEffect(() => {
    let result = products.filter(p => p.approved !== false);

    if (activeCategory === 'special-offers') {
      result = result.filter(p => p.isSpecialOffer || p.category?.toLowerCase() === 'special-offers');
    } else if (activeCategory !== 'all') {
      result = result.filter(p => {
        const pMain = (p.mainCategory || p.category || '').toLowerCase().trim();
        return pMain === activeCategory.toLowerCase().trim();
      });

      if (activeSubCategory !== 'all') {
        result = result.filter(p => {
          const pSub = (p.subCategory || p.subcat || p.category || '').toLowerCase().trim();
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

      {topThinAds.length > 0 && (
        <div className="w-full bg-black overflow-hidden relative z-40">
          <div 
            className={`flex ${isTopAdTransitioning ? 'transition-transform duration-600 ease-in-out' : ''}`} 
            style={{ transform: `translateX(-${currentTopAdIndex * 100}%)` }}
          >
            {topThinAds.map((ad, idx) => (
              <div key={ad.id + idx} className="min-w-full text-center">
                <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <img src={ad.imageUrl} alt="Top Ad" className="w-full max-h-[60px] object-cover mx-auto" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className={`sticky top-0 bg-white z-30 border-b border-gray-100 shadow-sm transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        
        {/* 🟢 SEARCH BAR (লাল দাগ চিহ্নিত একদম উপরে হেডার বা লোগোর ঠিক নিচে বসানো হয়েছে) */}
        <div className="max-w-xl mx-auto px-3 pt-3 pb-1 bg-white">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 প্রোডাক্টের নাম বা আইডি দিয়ে খুঁজুন..." 
            className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-xs bg-gray-50 outline-none shadow-xs focus:ring-2 focus:ring-[#e63946] text-black"
          />
        </div>

        {/* 🟢 TRENDYOL STYLE CIRCULAR CATEGORIES SECTION */}
        <div className="max-w-xl mx-auto px-3 py-2 bg-white border-b border-gray-100">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            
            <button 
              onClick={() => handleMainCategoryClick('all')}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
            >
              <div className={`w-[70px] h-[70px] rounded-full p-[2px] border-2 transition-all ${activeCategory === 'all' ? 'border-[#e63946] scale-105' : 'border-gray-200'}`}>
                <div className="w-full h-full rounded-full bg-red-50 flex items-center justify-center text-[#e63946] font-bold text-xs">
                  সব
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-800 mt-1.5">সকল</span>
            </button>

            {/* 🟢 SPECIAL OFFER BUTTON LINKED TO /special-offers */}
            <Link 
              href="/special-offer"
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer no-underline"
            >
              <div className="w-[70px] h-[70px] rounded-full p-[2px] border-2 border-pink-300 hover:border-pink-500 transition-all">
                <div className="w-full h-full rounded-full bg-pink-50 flex items-center justify-center text-[#e63946] font-bold text-xl">
                  🔥
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-800 mt-1.5">অফার</span>
            </Link>

            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleMainCategoryClick(cat.name)}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
              >
                <div className={`w-[70px] h-[70px] rounded-full p-[2px] border-2 transition-all shadow-sm ${activeCategory === cat.name ? 'border-[#e63946] scale-105' : 'border-gray-200'}`}>
                  <img 
                    src={cat.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover rounded-full bg-gray-100" 
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-800 mt-1.5 max-w-[70px] truncate">
                  {cat.name}
                </span>
              </button>
            ))}

          </div>
        </div>

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

      {promoBanners.length > 0 && (
        <div className="p-3 max-w-xl mx-auto">
          <div className="relative w-full h-[130px] rounded-xl overflow-hidden shadow-md">
            <div 
              className={`flex h-full ${isPromoTransitioning ? 'transition-transform duration-600 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}
            >
              {promoBanners.map((banner, idx) => (
                <div key={banner.id + idx} className="min-w-full h-full flex-shrink-0">
                  <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={banner.imageUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                  </a>
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1 bg-black/30 px-2 py-1 rounded-full z-10">
              {promoBanners.slice(0, promoBanners.length - 1).map((_, idx) => (
                <span 
                  key={idx} 
                  onClick={() => {
                    setIsPromoTransitioning(true);
                    setCurrentPromoIndex(idx);
                  }}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${currentPromoIndex === idx || (currentPromoIndex === promoBanners.length - 1 && idx === 0) ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
                    <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-2 flex flex-col justify-between flex-grow">
                    
                    {item.discount && Number(item.discount) > 0 && (
                      <span className="bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow w-max mb-1">
                        {item.discount}% ছাড়
                      </span>
                    )}

                    {item.productPin && (
                      <span className="text-[10px] text-[#e63946] font-bold bg-[#ffe5e6] px-1.5 py-0.5 rounded w-max mb-1">
                        📌 {item.productPin}
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-[11px] font-bold line-clamp-2 text-gray-800 flex-grow">{item.title}</h3>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(e, item.id);
                        }}
                        className={`w-6 h-6 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] shadow-sm transition-transform hover:scale-110 cursor-pointer ${isFav ? 'text-[#e63946]' : 'text-gray-400'}`}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>

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
