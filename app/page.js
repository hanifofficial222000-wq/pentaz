'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import NewFeatureSection from '@/components/NewFeatureSection';

// ⏱️ ক্লিন ও কম্প্যাক্ট রিয়েল-টাইম কাউন্টডাউন টাইমার
function FlashSaleTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!endsAt) return;

    const targetTime = endsAt?.toDate ? endsAt.toDate() : new Date(endsAt);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isExpired) {
    return <span className="text-red-500 font-bold text-[10px]">অফার শেষ</span>;
  }

  return (
    <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded shadow-xs w-full">
      <span>⏰</span>
      <span>{String(timeLeft.hours).padStart(2, '0')}</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
}

// 🖼️ ক্যাটাগরি কার্ড কম্পোনেন্ট যার ভেতরে একাধিক ছবি থাকলে অটো-প্লে হবে
function CategoryCardItem({ cat, isActive, onClick }) {
  const images = cat.imageUrls && Array.isArray(cat.imageUrls) && cat.imageUrls.length > 0 
    ? cat.imageUrls 
    : [cat.imageUrl || 'https://via.placeholder.com/150'];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer w-[66px]"
    >
      <div className={`w-[64px] h-[64px] rounded-full p-[2px] border-2 transition-all shadow-sm flex-shrink-0 relative overflow-hidden bg-gray-100 ${isActive ? 'border-[#e63946] scale-105' : 'border-gray-200'}`}>
        <img 
          src={images[currentImgIndex]} 
          alt={cat.name} 
          className="w-full h-full object-cover rounded-full transition-opacity duration-500" 
        />
      </div>
      <span className="text-[10px] font-bold text-gray-800 mt-1 w-full truncate text-center">
        {cat.name}
      </span>
    </button>
  );
}

function MainContent() {
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [topThinAds, setTopThinAds] = useState([]);
  const [fullPageAds, setFullPageAds] = useState([]);
  const [smallPopups, setSmallPopups] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  
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

  // ফুল-পেজ পপআপ অ্যাড স্টেট
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
    if (searchParamValue) {
      setSearchQuery(searchParamValue);
    } else {
      setSearchQuery('');
    }
  }, [searchParamValue]);

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
    // এপ্রুভড সেলার ফেচ করা
    const fetchApprovedSellers = async () => {
      try {
        const sellerSnap = await getDocs(collection(db, 'approved_sellers'));
        if (!sellerSnap.empty) {
          setApprovedSellers(sellerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error("Error fetching approved sellers:", err);
      }
    };
    fetchApprovedSellers();

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const now = new Date();
      const prodList = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.flashSaleEndsAt) {
          const endTime = data.flashSaleEndsAt?.toDate ? data.flashSaleEndsAt.toDate() : new Date(data.flashSaleEndsAt);
          if (endTime <= now) {
            data.isFlashSale = false;
          }
        }
        return { id: doc.id, ...data };
      });
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

        // 📱 ফুল ডিসপ্লে পপআপ ফেচ করার সঠিক সিস্টেম (orderBy createdAt desc)
        const fullQuery = query(collection(db, 'fullPageAds'), orderBy('createdAt', 'desc'));
        const fullSnap = await getDocs(fullQuery);
        if (!fullSnap.empty) {
          const fList = fullSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(f => !f.hidden && f.isActive !== false);
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

    if (activeCategory === 'special-offers' || activeCategory === 'flash-sale') {
      result = result.filter(p => p.isSpecialOffer || p.isFlashSale || p.category?.toLowerCase() === 'special-offers');
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

    if (activeSubFilter === 'flash-sale') {
      result = result.filter(p => p.isFlashSale);
    } else if (activeSubFilter === 'bestseller') {
      result = result.filter(p => p.bestseller || p.isBestSeller);
    } else if (activeSubFilter === 'discount') {
      result = result.filter(p => Number(p.discount || 0) >= 50 || p.isDiscountOffer);
    } else if (activeSubFilter === 'coupon') {
      result = result.filter(p => p.coupon || p.isPromoProduct);
    }

    if (searchQuery.trim() !== '') {
      const queryStr = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.title?.toLowerCase().includes(queryStr) ||
          p.id?.toLowerCase().includes(queryStr) ||
          p.productPin?.toLowerCase().includes(queryStr) ||
          p.category?.toLowerCase().includes(queryStr) ||
          p.mainCategory?.toLowerCase().includes(queryStr) ||
          p.subCategory?.toLowerCase().includes(queryStr)
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
      
      {/* 📱 ফুল ডিসপ্লে পপআপ অ্যাড ডিসপ্লে মডাল */}
      {showFullPopupModal && activePopupAd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden relative shadow-2xl p-4 text-center">
            <button 
              onClick={() => setShowFullPopupModal(false)}
              className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 cursor-pointer"
            >
              ✕
            </button>
            
            {activePopupAd.imageUrl && (
              <a href={activePopupAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block mt-4 mb-4">
                <img src={activePopupAd.imageUrl} alt="Full Page Popup Ad" className="w-full h-auto max-h-[350px] object-cover rounded-xl" />
              </a>
            )}

            <button 
              onClick={() => setShowFullPopupModal(false)}
              className="bg-[#e63946] text-white px-6 py-2.5 rounded-xl text-xs font-bold w-full cursor-pointer"
            >
              বন্ধ করুন / বুঝেছি
            </button>
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

      {/* ক্যাটাগরি সেকশন */}
      <header className="sticky top-0 bg-white z-30 border-b border-gray-100 shadow-sm">
        
        <div className="max-w-xl mx-auto px-3 py-2.5 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
          <div className="grid grid-flow-col grid-rows-2 gap-x-3.5 gap-y-2 w-max px-1">
            
            {mainCategories.map((cat) => (
              <CategoryCardItem 
                key={cat.id} 
                cat={cat} 
                isActive={activeCategory === cat.name} 
                onClick={() => handleMainCategoryClick(cat.name)} 
              />
            ))}

          </div>
        </div>

        {currentSubCategoriesList.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveSubCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              All ({activeCategory})
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

      {/* ফিল্টার সেকশন */}
      <div className="p-3 max-w-xl mx-auto">
        <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          {[
            { id: 'all', label: 'All Product' },
            { id: 'flash-sale', label: '⚡ Flash Sell' },
            { id: 'bestseller', label: '🔥 Best Seller' },
            { id: 'discount', label: '🏷️ Discount Offer' },
            { id: 'coupon', label: '🎟️ Promo' }
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

      {/* 🌟 ভেরিফাইড সেলার/ব্র্যান্ড সার্কেল সেকশন */}
      {approvedSellers.length > 0 && (
        <div className="max-w-xl mx-auto px-3 py-2 bg-white border-b border-gray-100 my-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {approvedSellers.map((seller) => (
              <Link 
                key={seller.id} 
                href={`/brand/${seller.id}`} 
                className="flex flex-col items-center flex-shrink-0 cursor-pointer w-[66px] no-underline"
              >
                <div className="w-[56px] h-[56px] rounded-full p-[2px] border-2 border-red-600 overflow-hidden shadow-sm bg-white hover:scale-105 transition-transform">
                  <img 
                    src={seller.profileUrl || 'https://via.placeholder.com/150'} 
                    alt={seller.brandName} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-800 mt-1 w-full truncate text-center">
                  {seller.brandName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchQuery && (
        <div className="max-w-xl mx-auto px-3 py-1 flex items-center justify-between text-xs text-gray-600">
          <span>অনুসন্ধান ফলাফল: &quot;<b>{searchQuery}</b>&quot;</span>
          <button 
            onClick={() => {
              setSearchQuery('');
              window.history.pushState({}, '', '/');
            }} 
            className="text-[#e63946] font-bold cursor-pointer underline"
          >
            রিসেট করুন
          </button>
        </div>
      )}

      {/* প্রডাক্ট লিস্ট */}
      <div className="max-w-xl mx-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 font-bold text-gray-500">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
        ) : (
          <div className="grid gap-2 grid-cols-3">
            {filteredProducts.map((item) => {
              const isFav = favorites.includes(item.id);
              const mainImg = item.imageUrl || item.image || (item.imageUrls && item.imageUrls[0]) || item.img || 'https://via.placeholder.com/300?text=No+Image';
              
              return (
                <Link 
                  href={`/product/${item.id}`} 
                  key={item.id} 
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col shadow-sm relative no-underline hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative w-full bg-gray-100 overflow-hidden h-[140px]">
                    <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                    {item.isFlashSale && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        ⚡ FLASH SALE
                      </span>
                    )}
                  </div>

                  <div className="p-2 flex flex-col justify-between flex-grow">
                    
                    {item.isFlashSale && item.flashSaleEndsAt && (
                      <div className="mb-1">
                        <FlashSaleTimer endsAt={item.flashSaleEndsAt} />
                      </div>
                    )}

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
                      <h3 className="font-bold line-clamp-2 text-gray-800 flex-grow text-[11px]">{item.title}</h3>
                      
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

                    <div className="text-[#e63946] text-xs font-bold mt-auto">
                      SAR {item.price || item.discountPrice}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <NewFeatureSection />

    </div>
  );
}

export default function AyaatShopHome() {
  return (
    <Suspense fallback={<div className="text-center py-10 font-bold text-gray-500">লোড হচ্ছে...</div>}>
      <MainContent />
    </Suspense>
  );
}
