'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function BannerAdsManagement() {
  const cloudName = "b3gsgcpl";
  const uploadPreset = "tho4ycz8";

  // Alert State
  const [alert, setAlert] = useState({ show: false, msg: '' });

  // Lists State
  const [topThinAds, setTopThinAds] = useState([]);
  const [fullPageAds, setFullPageAds] = useState([]);
  const [smallPopups, setSmallPopups] = useState([]);
  const [banners, setBanners] = useState([]);

  // Form Inputs State
  const [topAdLink, setTopAdLink] = useState('');
  const [topAdFile, setTopAdFile] = useState(null);
  const [topAdLoading, setTopAdLoading] = useState(false);

  const [fullAdLink, setFullAdLink] = useState('');
  const [fullAdActive, setFullAdActive] = useState(true);
  const [fullAdFile, setFullAdFile] = useState(null);
  const [fullAdLoading, setFullAdLoading] = useState(false);

  const [smallPopupLink, setSmallPopupLink] = useState('');
  const [smallPopupFile, setSmallPopupFile] = useState(null);
  const [smallPopupLoading, setSmallPopupLoading] = useState(false);

  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // Fetch Data Functions
  const loadTopThinAds = async () => {
    try {
      const q = query(collection(db, "topThinAds"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTopThinAds(list);
    } catch (err) { console.error(err); }
  };

  const loadFullPageAds = async () => {
    try {
      const q = query(collection(db, "fullPageAds"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFullPageAds(list);
    } catch (err) { console.error(err); }
  };

  const loadSmallPopups = async () => {
    try {
      const q = query(collection(db, "smallPopups"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSmallPopups(list);
    } catch (err) { console.error(err); }
  };

  const loadBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBanners(list);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadTopThinAds();
    loadFullPageAds();
    loadSmallPopups();
    loadBanners();
  }, []);

  // Cloudinary Upload Helper
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const cloudData = await res.json();
    if (!cloudData.secure_url) throw new Error("Upload Failed");
    return cloudData.secure_url;
  };

  // 1. Top Thin Ad Submit
  const handleTopAdSubmit = async (e) => {
    e.preventDefault();
    if (!topAdFile) return;
    setTopAdLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(topAdFile);
      await addDoc(collection(db, "topThinAds"), {
        imageUrl,
        link: topAdLink.trim(),
        hidden: false,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 টপ অ্যাড সফলভাবে যোগ করা হয়েছে!");
      setTopAdLink('');
      setTopAdFile(null);
      document.getElementById('topAdImageInput').value = '';
      loadTopThinAds();
    } catch (err) {
      console.error(err);
      alert("⚠️ টপ অ্যাড আপলোড করতে সমস্যা হয়েছে!");
    } finally {
      setTopAdLoading(false);
    }
  };

  const toggleTopAdHide = async (docId, currentHidden) => {
    await updateDoc(doc(db, "topThinAds", docId), { hidden: !currentHidden });
    loadTopThinAds();
  };

  const deleteTopAd = async (docId) => {
    if (confirm("ডিলিট করতে চান?")) {
      await deleteDoc(doc(db, "topThinAds", docId));
      loadTopThinAds();
    }
  };

  // 2. Full Page Popup Ad Submit
  const handleFullAdSubmit = async (e) => {
    e.preventDefault();
    if (!fullAdFile) return;
    setFullAdLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(fullAdFile);
      await addDoc(collection(db, "fullPageAds"), {
        imageUrl,
        link: fullAdLink.trim(),
        isActive: fullAdActive,
        hidden: false,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 ফুল-পেজ পপআপ সফলভাবে যোগ করা হয়েছে!");
      setFullAdLink('');
      setFullAdActive(true);
      setFullAdFile(null);
      document.getElementById('fullAdImageInput').value = '';
      loadFullPageAds();
    } catch (err) {
      console.error(err);
      alert("⚠️ পপআপ আপলোড করতে সমস্যা হয়েছে!");
    } finally {
      setFullAdLoading(false);
    }
  };

  const toggleFullAdHide = async (docId, currentHidden) => {
    await updateDoc(doc(db, "fullPageAds", docId), { hidden: !currentHidden });
    loadFullPageAds();
  };

  const deleteFullAd = async (docId) => {
    if (confirm("ডিলিট করতে চান?")) {
      await deleteDoc(doc(db, "fullPageAds", docId));
      loadFullPageAds();
    }
  };

  // 3. Small / Floating Popup Ad Submit
  const handleSmallPopupSubmit = async (e) => {
    e.preventDefault();
    if (!smallPopupFile) return;
    setSmallPopupLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(smallPopupFile);
      await addDoc(collection(db, "smallPopups"), {
        imageUrl,
        link: smallPopupLink.trim(),
        hidden: false,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 ছোট পপআপ সফলভাবে যোগ করা হয়েছে!");
      setSmallPopupLink('');
      setSmallPopupFile(null);
      document.getElementById('smallPopupImageInput').value = '';
      loadSmallPopups();
    } catch (err) {
      console.error(err);
      alert("⚠️ ছোট পপআপ আপলোড করতে সমস্যা হয়েছে!");
    } finally {
      setSmallPopupLoading(false);
    }
  };

  const toggleSmallPopupHide = async (docId, currentHidden) => {
    await updateDoc(doc(db, "smallPopups", docId), { hidden: !currentHidden });
    loadSmallPopups();
  };

  const deleteSmallPopup = async (docId) => {
    if (confirm("ডিলিট করতে চান?")) {
      await deleteDoc(doc(db, "smallPopups", docId));
      loadSmallPopups();
    }
  };

  // 4. Regular Slider Banner Submit
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile) return;
    setBannerLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(bannerFile);
      await addDoc(collection(db, "banners"), {
        imageUrl,
        title: bannerTitle.trim(),
        hidden: false,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 ব্যানার সফলভাবে যোগ করা হয়েছে!");
      setBannerTitle('');
      setBannerFile(null);
      document.getElementById('bannerImageInput').value = '';
      loadBanners();
    } catch (err) {
      console.error(err);
      alert("⚠️ ব্যানার আপলোড করতে সমস্যা হয়েছে!");
    } finally {
      setBannerLoading(false);
    }
  };

  const toggleBannerHide = async (docId, currentHiddenState) => {
    await updateDoc(doc(db, "banners", docId), { hidden: !currentHiddenState });
    loadBanners();
  };

  const deleteBanner = async (docId) => {
    if (confirm("ডিলিট করতে চান?")) {
      await deleteDoc(doc(db, "banners", docId));
      loadBanners();
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">

      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-purple-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-purple-200 text-xs mt-1">ব্যানার ও অ্যাড ম্যানেজমেন্ট সিস্টেম</p>
        </div>
        <Link href="/admin/control-room" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer no-underline">
          <span>⚙️ কন্ট্রোল রুম</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        
        {/* Alert Box */}
        {alert.show && (
          <div className="p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        {/* ================= 1. MULTIPLE TOP THIN AD MANAGEMENT ================= */}
        <div className="bg-rose-50 p-5 rounded-xl border border-rose-200 shadow-sm">
          <h3 className="text-lg font-bold text-rose-900 mb-3 flex items-center gap-2">
            📏 টপ চিকন অ্যাড ব্যানার (Top Thin Ads - Auto Slider)
          </h3>
          
          <form onSubmit={handleTopAdSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">অ্যাডের ছবি সিলেক্ট করুন</label>
              <input 
                type="file" 
                id="topAdImageInput" 
                accept="image/*" 
                required 
                onChange={(e) => setTopAdFile(e.target.files[0])}
                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্লিক করলে যে লিংকে যাবে (Link - ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={topAdLink}
                onChange={(e) => setTopAdLink(e.target.value)}
                placeholder="category.html?cat=jersey" 
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
              />
            </div>
            <button 
              type="submit" 
              disabled={topAdLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer"
            >
              {topAdLoading ? "আপলোড হচ্ছে..." : "➕ নতুন টপ অ্যাড যোগ করুন"}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">আপলোড করা টপ চিকন অ্যাড সমূহ:</p>
            <div className="space-y-3">
              {topThinAds.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো টপ অ্যাড নেই!</p>
              ) : (
                topThinAds.map((ad) => {
                  const isHidden = ad.hidden === true;
                  return (
                    <div key={ad.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={ad.imageUrl} alt="Ad" className="w-20 h-12 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">লিংক: {ad.link ? ad.link : 'নেই'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isHidden ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isHidden ? '👁️‍🗨️ হাইড আছে' : '🟢 লাইভ আছে'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleTopAdHide(ad.id, isHidden)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          {isHidden ? 'Show 👁️' : 'Hide 🙈'}
                        </button>
                        <button onClick={() => deleteTopAd(ad.id)} className="bg-red-100 hover:bg-red-200 text-red-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          🗑️ ডিলিট
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= 2. MULTIPLE FULL PAGE POPUP AD MANAGEMENT ================= */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            📱 ফুল-পেজ পপআপ অ্যাড ম্যানেজমেন্ট (একাধিক পপআপ যোগ করার বক্স)
          </h3>
          
          <form onSubmit={handleFullAdSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">পপআপ অ্যাডের ছবি সিলেক্ট করুন</label>
              <input 
                type="file" 
                id="fullAdImageInput" 
                accept="image/*" 
                required 
                onChange={(e) => setFullAdFile(e.target.files[0])}
                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্লিক করলে যে লিংকে যাবে (Link - ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={fullAdLink}
                onChange={(e) => setFullAdLink(e.target.value)}
                placeholder="category.html?cat=special-offers" 
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="fullAdActive" 
                  checked={fullAdActive}
                  onChange={(e) => setFullAdActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded" 
                />
                <label htmlFor="fullAdActive" className="text-xs font-bold text-slate-700 cursor-pointer">পপআপ অন রাখুন (Active)</label>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={fullAdLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer"
            >
              {fullAdLoading ? "আপলোড হচ্ছে..." : "➕ নতুন ফুল-পেজ পপআপ যোগ করুন"}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">আপলোড করা ফুল-পেজ পপআপ সমূহ (ডিলিট ও হাইড কন্ট্রোল):</p>
            <div className="space-y-3">
              {fullPageAds.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো ফুল-পেজ পপআপ নেই!</p>
              ) : (
                fullPageAds.map((ad) => {
                  const isHidden = ad.hidden === true;
                  const isActive = ad.isActive === true;
                  return (
                    <div key={ad.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={ad.imageUrl} alt="Popup" className="w-20 h-12 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">লিংক: {ad.link ? ad.link : 'নেই'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isHidden ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isHidden ? '👁️‍🗨️ হাইড আছে' : (isActive ? '🟢 লাইভ আছে' : '🟡 ইনঅ্যাক্টিভ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleFullAdHide(ad.id, isHidden)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          {isHidden ? 'Show 👁️' : 'Hide 🙈'}
                        </button>
                        <button onClick={() => deleteFullAd(ad.id)} className="bg-red-100 hover:bg-red-200 text-red-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          🗑️ ডিলিট
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= 3. SMALL / FLOATING POPUP AD MANAGEMENT ================= */}
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            🟡 ছোট পপআপ / ফ্লটিং অ্যাড ম্যানেজমেন্ট (Small / Floating Popup)
          </h3>
          
          <form onSubmit={handleSmallPopupSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ছোট পপআপের ছবি সিলেক্ট করুন</label>
              <input 
                type="file" 
                id="smallPopupImageInput" 
                accept="image/*" 
                required 
                onChange={(e) => setSmallPopupFile(e.target.files[0])}
                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্লিক করলে যে লিংকে যাবে (Link - ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={smallPopupLink}
                onChange={(e) => setSmallPopupLink(e.target.value)}
                placeholder="category.html?cat=offer" 
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
              />
            </div>
            <button 
              type="submit" 
              disabled={smallPopupLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer"
            >
              {smallPopupLoading ? "আপলোড হচ্ছে..." : "➕ নতুন ছোট পপআপ যোগ করুন"}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">আপলোড করা ছোট পপআপ সমূহ:</p>
            <div className="space-y-3">
              {smallPopups.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো ছোট পপআপ নেই!</p>
              ) : (
                smallPopups.map((ad) => {
                  const isHidden = ad.hidden === true;
                  return (
                    <div key={ad.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={ad.imageUrl} alt="Small Popup" className="w-20 h-12 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">লিংক: {ad.link ? ad.link : 'নেই'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isHidden ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isHidden ? '👁️‍🗨️ হাইড আছে' : '🟢 লাইভ আছে'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleSmallPopupHide(ad.id, isHidden)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          {isHidden ? 'Show 👁️' : 'Hide 🙈'}
                        </button>
                        <button onClick={() => deleteSmallPopup(ad.id)} className="bg-red-100 hover:bg-red-200 text-red-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          🗑️ ডিলিট
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= 4. REGULAR SLIDER BANNER MANAGEMENT ================= */}
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 shadow-sm">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            🖼️ হোম স্লাইডার ব্যানার ম্যানেজমেন্ট
          </h3>
          
          <form onSubmit={handleBannerSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">স্লাইডার ব্যানার ইমেজ আপলোড করুন</label>
              <input 
                type="file" 
                id="bannerImageInput" 
                accept="image/*" 
                required 
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ব্যানারের শিরোনাম / লিংক (ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="যেমন: Eid Mega Sale 50% Off" 
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
            </div>
            <button 
              type="submit" 
              disabled={bannerLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer"
            >
              {bannerLoading ? "আপলোড হচ্ছে..." : "➕ নতুন স্লাইডার ব্যানার সেভ করুন"}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">আপলোড করা স্লাইডার ব্যানার সমূহ:</p>
            <div className="space-y-3">
              {banners.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো ব্যানার নেই!</p>
              ) : (
                banners.map((banner) => {
                  const isHidden = banner.hidden === true;
                  return (
                    <div key={banner.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={banner.imageUrl} alt="Banner" className="w-20 h-12 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{banner.title || 'ব্যানার'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isHidden ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isHidden ? '👁️‍🗨️ হাইড আছে' : '🟢 লাইভ আছে'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleBannerHide(banner.id, isHidden)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          {isHidden ? 'Show 👁️' : 'Hide 🙈'}
                        </button>
                        <button onClick={() => deleteBanner(banner.id)} className="bg-red-100 hover:bg-red-200 text-red-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                          🗑️ ডিলিট
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
