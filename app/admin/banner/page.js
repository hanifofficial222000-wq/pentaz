'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function BannerAdsManagement() {
  const cloudName = "b3gsgcpl";
  const uploadPreset = "tho4ycz8";

  const [alert, setAlert] = useState({ show: false, msg: '' });

  const [topThinAds, setTopThinAds] = useState([]);
  const [fullPageAds, setFullPageAds] = useState([]);
  const [smallPopups, setSmallPopups] = useState([]);
  const [banners, setBanners] = useState([]);

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

  const loadTopThinAds = async () => {
    try {
      const q = query(collection(db, "topThinAds"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setTopThinAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  const loadFullPageAds = async () => {
    try {
      const q = query(collection(db, "fullPageAds"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setFullPageAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  const loadSmallPopups = async () => {
    try {
      const q = query(collection(db, "smallPopups"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSmallPopups(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  const loadBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setBanners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadTopThinAds();
    loadFullPageAds();
    loadSmallPopups();
    loadBanners();
  }, []);

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
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-purple-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SHOP LTD</h1>
          <p className="text-purple-200 text-xs mt-1">ব্যানার ও অ্যাড ম্যানেজমেন্ট সিস্টেম</p>
        </div>
        <Link href="/admin/control-room" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer no-underline">
          <span>⚙️ কন্ট্রোল রুম</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        {alert.show && (
          <div className="p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        {/* Top Thin Ads Section */}
        <div className="bg-rose-50 p-5 rounded-xl border border-rose-200 shadow-sm">
          <h3 className="text-lg font-bold text-rose-900 mb-3">📏 টপ চিকন অ্যাড ব্যানার (Auto Slider)</h3>
          <form onSubmit={handleTopAdSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ছবি সিলেক্ট করুন</label>
              <input type="file" id="topAdImageInput" accept="image/*" required onChange={(e) => setTopAdFile(e.target.files[0])} className="w-full text-xs border rounded-lg bg-slate-50 cursor-pointer p-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">লিংক (ঐচ্ছিক)</label>
              <input type="text" value={topAdLink} onChange={(e) => setTopAdLink(e.target.value)} placeholder="লিংক দিন" className="w-full border p-2.5 rounded-lg text-xs text-black" />
            </div>
            <button type="submit" disabled={topAdLoading} className="w-full bg-rose-600 text-white font-semibold py-2.5 rounded-lg text-xs cursor-pointer">
              {topAdLoading ? "আপলোড হচ্ছে..." : "➕ যোগ করুন"}
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {topThinAds.map((ad) => (
              <div key={ad.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <img src={ad.imageUrl} alt="Ad" className="w-20 h-12 object-cover rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={() => toggleTopAdHide(ad.id, ad.hidden)} className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">
                    {ad.hidden ? 'Show 👁️' : 'Hide 🙈'}
                  </button>
                  <button onClick={() => deleteTopAd(ad.id)} className="bg-red-100 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">🗑️ ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Page Popup Ads Section */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📱 ফুল-পেজ পপআপ অ্যাড ম্যানেজমেন্ট</h3>
          <form onSubmit={handleFullAdSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ছবি সিলেক্ট করুন</label>
              <input type="file" id="fullAdImageInput" accept="image/*" required onChange={(e) => setFullAdFile(e.target.files[0])} className="w-full text-xs border rounded-lg bg-slate-50 cursor-pointer p-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">লিংক (ঐচ্ছিক)</label>
              <input type="text" value={fullAdLink} onChange={(e) => setFullAdLink(e.target.value)} placeholder="লিংক দিন" className="w-full border p-2.5 rounded-lg text-xs text-black" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fullAdActive" checked={fullAdActive} onChange={(e) => setFullAdActive(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="fullAdActive" className="text-xs font-bold text-slate-700 cursor-pointer">পপআপ অন রাখুন (Active)</label>
            </div>
            <button type="submit" disabled={fullAdLoading} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-xs cursor-pointer">
              {fullAdLoading ? "আপলোড হচ্ছে..." : "➕ যোগ করুন"}
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {fullPageAds.map((ad) => (
              <div key={ad.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <img src={ad.imageUrl} alt="Popup" className="w-20 h-12 object-cover rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={() => toggleFullAdHide(ad.id, ad.hidden)} className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">
                    {ad.hidden ? 'Show 👁️' : 'Hide 🙈'}
                  </button>
                  <button onClick={() => deleteFullAd(ad.id)} className="bg-red-100 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">🗑️ ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Small Popup Ads Section */}
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <h3 className="text-lg font-bold text-amber-900 mb-3">🟡 ছোট পপআপ / সার্কেল স্টোরি অ্যাড</h3>
          <form onSubmit={handleSmallPopupSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ছবি সিলেক্ট করুন</label>
              <input type="file" id="smallPopupImageInput" accept="image/*" required onChange={(e) => setSmallPopupFile(e.target.files[0])} className="w-full text-xs border rounded-lg bg-slate-50 cursor-pointer p-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">লিংক (ঐচ্ছিক)</label>
              <input type="text" value={smallPopupLink} onChange={(e) => setSmallPopupLink(e.target.value)} placeholder="লিংক দিন" className="w-full border p-2.5 rounded-lg text-xs text-black" />
            </div>
            <button type="submit" disabled={smallPopupLoading} className="w-full bg-amber-600 text-white font-semibold py-2.5 rounded-lg text-xs cursor-pointer">
              {smallPopupLoading ? "আপলোড হচ্ছে..." : "➕ যোগ করুন"}
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {smallPopups.map((ad) => (
              <div key={ad.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <img src={ad.imageUrl} alt="Small Popup" className="w-20 h-12 object-cover rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={() => toggleSmallPopupHide(ad.id, ad.hidden)} className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">
                    {ad.hidden ? 'Show 👁️' : 'Hide 🙈'}
                  </button>
                  <button onClick={() => deleteSmallPopup(ad.id)} className="bg-red-100 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">🗑️ ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Slider Banner Section */}
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 shadow-sm">
          <h3 className="text-lg font-bold text-purple-900 mb-3">🖼️ হোম স্লাইডার ব্যানার ম্যানেজমেন্ট</h3>
          <form onSubmit={handleBannerSubmit} className="space-y-4 bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ব্যানার ইমেজ আপلود করুন</label>
              <input type="file" id="bannerImageInput" accept="image/*" required onChange={(e) => setBannerFile(e.target.files[0])} className="w-full text-xs border rounded-lg bg-slate-50 cursor-pointer p-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">শিরোনাম বা লিংক</label>
              <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="যেমন: Mega Sale" className="w-full border p-2.5 rounded-lg text-xs text-black" />
            </div>
            <button type="submit" disabled={bannerLoading} className="w-full bg-purple-600 text-white font-semibold py-2.5 rounded-lg text-xs cursor-pointer">
              {bannerLoading ? "আপলোড হচ্ছে..." : "➕ যোগ করুন"}
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <img src={banner.imageUrl} alt="Banner" className="w-20 h-12 object-cover rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={() => toggleBannerHide(banner.id, banner.hidden)} className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">
                    {banner.hidden ? 'Show 👁️' : 'Hide 🙈'}
                  </button>
                  <button onClick={() => deleteBanner(banner.id)} className="bg-red-100 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer">🗑️ ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
