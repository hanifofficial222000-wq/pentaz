'use client';

import React, { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3NXjyFRvir6EjTQz4nrDTQTQ8ESFpF8o",
  authDomain: "ayaat-shop.firebaseapp.com",
  projectId: "ayaat-shop",
  storageBucket: "ayaat-shop.firebasestorage.app",
  messagingSenderId: "762175348619",
  appId: "1:762175348619:web:9d547dfe03ebc76e92998e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [fullAds, setFullAds] = useState([]);
  const [showFullModal, setShowFullModal] = useState(false);
  const [smallPopups, setSmallPopups] = useState([]);
  const [showWidget, setShowWidget] = useState(false);
  const [topThinAds, setTopThinAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [activeCat, setActiveCat] = useState('all');
  
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);
  const [isNavHidden, setIsNavHidden] = useState(false);

  useEffect(() => {
    // LocalStorage & Referral Setup
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('referred_by', ref);

    const favs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    setFavorites(favs);
    const cart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    setCartCount(cart.length);

    async function fetchData() {
      try {
        // 1. Full Page Ads
        const fullSnap = await getDocs(collection(db, "fullPageAds"));
        const fullList = [];
        fullSnap.forEach(d => {
          const dat = d.data();
          if (dat.imageUrl && !dat.hidden && dat.isActive) fullList.push(dat);
        });
        setFullAds(fullList);
        if (fullList.length > 0) setShowFullModal(true);

        // 2. Small Popups
        const smallSnap = await getDocs(collection(db, "smallPopups"));
        const smallList = [];
        smallSnap.forEach(d => {
          const dat = d.data();
          if (dat.imageUrl && !dat.hidden) smallList.push(dat);
        });
        setSmallPopups(smallList);
        if (smallList.length > 0) setShowWidget(true);

        // 3. Top Thin Ads
        const topSnap = await getDocs(collection(db, "topThinAds"));
        const topList = [];
        topSnap.forEach(d => {
          const dat = d.data();
          if (dat.imageUrl && !dat.hidden) topList.push(dat);
        });
        setTopThinAds(topList);

        // 4. Banners
        const bannerSnap = await getDocs(collection(db, "banners"));
        const bannerList = [];
        bannerSnap.forEach(d => {
          const dat = d.data();
          if (dat.imageUrl && !dat.hidden) bannerList.push(dat);
        });
        setBanners(bannerList);

        // 5. Main Categories
        const catSnap = await getDocs(collection(db, "mainCategories"));
        const catList = [];
        catSnap.forEach(d => catList.push({ id: d.id, ...d.data() }));
        setCategories(catList);

        // 6. Products (Updated with where approved == true to block unapproved/old products)
        const pQuery = query(
          collection(db, "products"), 
          where("approved", "==", true), 
          orderBy("createdAt", "desc")
        );
        const pSnap = await getDocs(pQuery);
        const pList = [];
        pSnap.forEach(d => pList.push({ id: d.id, ...d.data() }));
        setProducts(pList);
        setFilteredProducts(pList);

        // 7. User Gift Badge
        const userId = localStorage.getItem('user_uid');
        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const uData = userDoc.data();
            let gCount = 0;
            if (uData.giftProduct1?.trim()) gCount++;
            if (uData.giftProduct2?.trim()) gCount++;
            if (uData.giftProduct3?.trim()) gCount++;
            setGiftCount(gCount);
          }
        }
      } catch (err) {
        console.error("Firebase fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Scroll listener for nav bar hide/show
    let lastScroll = 0;
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScroll && st > 50) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }
      lastScroll = st <= 0 ? 0 : st;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Promo Banner Auto Slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    let favs = [...favorites];
    const idx = favs.indexOf(id);
    if (idx > -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(id);
    }
    setFavorites(favs);
    localStorage.setItem('ayaat_favorites', JSON.stringify(favs));
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase().trim();
    setSearchQuery(val);
    filterAndSearch(val, activeSubFilter, activeCat);
  };

  const applySubFilter = (type) => {
    setActiveSubFilter(type);
    filterAndSearch(searchQuery, type, activeCat);
  };

  const filterCat = (catKey) => {
    setActiveCat(catKey);
    if (catKey === 'all') {
      setFilteredProducts(products);
    } else {
      window.location.href = `category.html?cat=${encodeURIComponent(catKey)}`;
    }
  };

  const filterAndSearch = (queryVal, subType, catKey) => {
    let result = [...products];
    if (catKey !== 'all') {
      result = result.filter(p => p.mainCategory?.toLowerCase().trim() === catKey);
    }
    if (subType === 'bestseller') {
      result = result.filter(p => p.bestseller === true);
    } else if (subType === 'discount') {
      result = result.filter(p => Number(p.discount || 0) >= 50);
    } else if (subType === 'coupon') {
      result = result.filter(p => p.coupon === true);
    }

    if (queryVal) {
      result = result.filter(p => 
        p.title?.toLowerCase().includes(queryVal) ||
        p.id?.toLowerCase().includes(queryVal) ||
        p.productPin?.toLowerCase().includes(queryVal)
      );
    }
    setFilteredProducts(result);
  };

  return (
    <>
      {/* LOADING SCREEN */}
      {loading && (
        <div id="loading-screen" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999 }}>
          <div className="loading-container" style={{ position: 'relative', width: 100, height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner-ring" style={{ position: 'absolute', width: 90, height: 90, border: '4px solid #f3f3f3', borderTop: '4px solid #e63946', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <img src="images/logo.png" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '50%' }} />
          </div>
        </div>
      )}

      {/* TOP THIN AD SLIDER */}
      {topThinAds.length > 0 && (
        <div style={{ width: '100%', background: '#000', overflow: 'hidden', position: 'relative', zIndex: 1000 }}>
          <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out' }}>
            {topThinAds.map((ad, i) => (
              <div key={i} style={{ minWidth: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
                {ad.link ? (
                  <a href={ad.link} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%' }}>
                    <img src={ad.imageUrl} alt="Top Thin Ad" style={{ width: '100%', maxHeight: 60, objectFit: 'cover', display: 'block' }} />
                  </a>
                ) : (
                  <img src={ad.imageUrl} alt="Top Thin Ad" style={{ width: '100%', maxHeight: 60, objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY BAR */}
      <header>
        <div className="category-bar" style={{ display: 'flex', overflowX: 'auto', gap: 8, padding: '12px 10px', background: '#fff', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', marginTop: 10 }}>
          <button onClick={() => filterCat('all')} className={`cat-btn ${activeCat === 'all' ? 'active' : ''}`} style={{ padding: '8px 18px', border: '1px solid #eee', borderRadius: 20, background: activeCat === 'all' ? '#e63946' : '#f8f9fa', color: activeCat === 'all' ? '#fff' : '#333', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>সব</button>
          <button onClick={() => filterCat('special-offers')} className="cat-btn" style={{ padding: '8px 18px', border: '1px solid #eee', borderRadius: 20, background: '#ffe5e8', color: '#e63946', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>🔥 স্পেশাল অফার</button>
          {categories.map(cat => {
            const key = cat.name.toLowerCase().trim();
            return (
              <button key={cat.id} onClick={() => filterCat(key)} className="cat-btn" style={{ padding: '8px 18px', border: '1px solid #eee', borderRadius: 20, background: '#f8f9fa', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
                {cat.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* SEARCH BOX */}
      <div style={{ padding: 10, maxWidth: 600, margin: '0 auto' }}>
        <input type="text" value={searchQuery} onChange={handleSearch} placeholder="🔍 প্রোডাক্টের নাম বা আইডি দিয়ে খুঁজুন..." style={{ width: '100%', padding: '12px 15px', border: '1px solid #eaeaea', borderRadius: 10, fontSize: 14, background: '#fff', outline: 'none' }} />
      </div>

      {/* PROMO BANNER SECTION */}
      {banners.length > 0 && (
        <div style={{ padding: 10, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ position: 'relative', width: '100%', height: 130, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%', transform: `translateX(-${activeBannerIndex * 100}%)`, transition: 'transform 0.4s ease-in-out' }}>
              {banners.map((b, i) => (
                <div key={i} style={{ flex: '0 0 100%', width: '100%', height: '100%' }}>
                  {b.link ? (
                    <a href={b.link} target="_blank" rel="noreferrer"><img src={b.imageUrl} alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></a>
                  ) : (
                    <img src={b.imageUrl} alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: '3px 6px', borderRadius: 10 }}>
              {banners.map((_, i) => (
                <span key={i} onClick={() => setActiveBannerIndex(i)} style={{ width: activeBannerIndex === i ? 14 : 6, height: 6, background: activeBannerIndex === i ? '#fff' : 'rgba(255,255,255,0.5)', borderRadius: activeBannerIndex === i ? 4 : '50%', cursor: 'pointer', transition: '0.2s' }}></span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO SECTION */}
      <div style={{ padding: 10, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 15, color: '#111' }}>🔥 ট্রেন্ডিং ভিডিও</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {['jersey', 't-shirt', 'shoes', 'baby'].map((vidCat, idx) => (
            <div key={idx} onClick={() => window.location.href = `category.html?cat=${vidCat}`} style={{ flex: '0 0 calc((100% - 20px) / 3)', minWidth: 'calc((100% - 20px) / 3)', textAlign: 'center', cursor: 'pointer', background: '#fff', padding: 5, borderRadius: 12, boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
              <video src={`videos/video${idx + 1}.mp4`} autoPlay muted loop playsInline style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, display: 'block' }}></video>
              <p style={{ fontSize: 11, marginTop: 5, fontWeight: 'bold', color: '#444' }}>{vidCat === 'jersey' ? 'জার্সি' : vidCat === 't-shirt' ? 'টি-শার্ট' : vidCat === 'shoes' ? 'জুতো' : 'বেবি কালেকশন'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SUB-FILTER BAR */}
      <div style={{ padding: 10, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button className={`filter-chip ${activeSubFilter === 'all' ? 'active' : ''}`} onClick={() => applySubFilter('all')} style={{ padding: '6px 14px', background: activeSubFilter === 'all' ? '#e63946' : '#f1f3f5', color: activeSubFilter === 'all' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: 20, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>সকল প্রোডাক্ট</button>
          <button className={`filter-chip ${activeSubFilter === 'bestseller' ? 'active' : ''}`} onClick={() => applySubFilter('bestseller')} style={{ padding: '6px 14px', background: activeSubFilter === 'bestseller' ? '#e63946' : '#f1f3f5', color: activeSubFilter === 'bestseller' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: 20, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>🔥 সেরা বিকেশিত</button>
          <button className={`filter-chip ${activeSubFilter === 'discount' ? 'active' : ''}`} onClick={() => applySubFilter('discount')} style={{ padding: '6px 14px', background: activeSubFilter === 'discount' ? '#e63946' : '#f1f3f5', color: activeSubFilter === 'discount' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: 20, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>🏷️ ৫০% বা তার বেশি ছাড়</button>
          <button className={`filter-chip ${activeSubFilter === 'coupon' ? 'active' : ''}`} onClick={() => applySubFilter('coupon')} style={{ padding: '6px 14px', background: activeSubFilter === 'coupon' ? '#e63946' : '#f1f3f5', color: activeSubFilter === 'coupon' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: 20, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>🎟️ কুপন সহ</button>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 8, paddingBottom: 70 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 30, color: '#666', fontWeight: 'bold' }}>কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
          ) : (
            filteredProducts.map(item => {
              const isFav = favorites.includes(item.id);
              const pin = item.productPin || item.id.slice(0, 6).toUpperCase();
              const mainImg = item.imageUrls?.[0] || item.imageUrl || 'https://via.placeholder.com/200';
              return (
                <div key={item.id} style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                  <div style={{ position: 'relative', width: '100%', height: 140, overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.location.href = `product.html?id=${item.id}`}>
                    {item.discount && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: '3px 7px', borderRadius: 6, zIndex: 11 }}>{item.discount}% ছাড়</div>
                    )}
                    <button onClick={(e) => toggleFavorite(e, item.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 11 }}>
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <img src={mainImg} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, cursor: 'pointer' }} onClick={() => window.location.href = `product.html?id=${item.id}`}>
                    <span style={{ fontSize: 10, color: '#e63946', fontWeight: 'bold', background: '#ffe5e6', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 4, alignSelf: 'flex-start' }}>📌 {pin}</span>
                    <h3 style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</h3>
                    <div style={{ color: '#e63946', fontSize: 13, fontWeight: 'bold', marginTop: 'auto' }}>SAR {item.price}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/8801835302525" target="_blank" rel="noreferrer" style={{ position: 'fixed', bottom: isNavHidden ? 15 : 75, right: 15, background: '#25D366', color: '#fff', width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 999, transition: 'bottom 0.3s ease-in-out' }}>💬</a>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#ffffff', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 1000, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', transform: isNavHidden ? 'translateY(100%)' : 'translateY(0)', transition: 'transform 0.3s ease-in-out' }}>
        <a href="index.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#e63946', fontSize: 11, fontWeight: 'bold' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </a>
        <a href="category.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 'bold' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Categories
        </a>
        <a href="my-gifts.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 'bold', position: 'relative' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line></svg>
          Gift
          <span style={{ position: 'absolute', top: -3, right: 4, background: '#e63946', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10, fontWeight: 'bold' }}>{giftCount}</span>
        </a>
        <a href="favorites.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 'bold', position: 'relative' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          Favorites
          <span style={{ position: 'absolute', top: -3, right: 4, background: '#e63946', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10, fontWeight: 'bold' }}>{favorites.length}</span>
        </a>
        <a href="cart.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 'bold', position: 'relative' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          Cart
          <span style={{ position: 'absolute', top: -3, right: 4, background: '#e63946', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10, fontWeight: 'bold' }}>{cartCount}</span>
        </a>
        <a href="register.html" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 'bold' }}>
          <svg style={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Account
        </a>
      </nav>

      {/* FULL SCREEN POPUP MODAL */}
      {showFullModal && fullAds.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
          <div style={{ position: 'relative', maxWidth: 480, width: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', textAlign: 'center' }}>
            <button onClick={() => setShowFullModal(false)} style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: '#1e293b', color: '#fff', border: '2px solid #fff', width: 34, height: 34, borderRadius: '50%', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            {fullAds.map((ad, idx) => (
              <div key={idx}>
                {ad.link ? (
                  <a href={ad.link} target="_blank" rel="noreferrer"><img src={ad.imageUrl} alt="Ad" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block', background: '#000' }} /></a>
                ) : (
                  <img src={ad.imageUrl} alt="Ad" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block', background: '#000' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING ROUND WIDGET */}
      {showWidget && smallPopups.length > 0 && (
        <div onClick={() => setShowFullModal(true)} style={{ position: 'fixed', bottom: 85, right: 15, zIndex: 99999, cursor: 'pointer', animation: 'bounce 2s infinite' }}>
          <div style={{ position: 'relative', width: 95, height: 95, background: 'linear-gradient(135deg, #e63946, #d62828)', borderRadius: '50%', boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', overflow: 'hidden' }}>
            <button onClick={(e) => { e.stopPropagation(); setShowWidget(false); }} style={{ position: 'absolute', top: 2, right: 2, zIndex: 10, background: '#1e293b', color: 'white', border: '2px solid white', width: 25, height: 25, borderRadius: '50%', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            <img src={smallPopups[0].imageUrl} alt="Widget" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
        </div>
      )}
    </>
  );
}
