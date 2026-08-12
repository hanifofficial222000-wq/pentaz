'use client';
import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function HomeEditor() {
  const [data, setData] = useState({ 
    homeNotice: '', 
    homeBanner: '', 
    showSlider: true,
    adText: '' 
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ফায়ারবেস থেকে আগের ডেটা লোড করা
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "home_settings", "main"));
        if (snap.exists()) {
          setData(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (error) {
        console.error("Error loading home settings:", error);
      }
    }
    load();
  }, []);

  // সেভ করার ফাংশন
  const handleSave = async () => {
    setLoading(true);
    try {
      let bannerUrl = data.homeBanner;

      // নতুন ব্যানার ফাইল সিলেক্ট করা থাকলে ফায়ারবেস স্টোরেজে আপলোড হবে
      if (bannerFile) {
        const fileRef = ref(storage, `home/banner_${Date.now()}_${bannerFile.name}`);
        await uploadBytes(fileRef, bannerFile);
        bannerUrl = await getDownloadURL(fileRef);
      }

      // ফায়ারস্টোর ডাটাবেজে ডেটা সেভ করা
      await setDoc(doc(db, "home_settings", "main"), {
        ...data,
        homeBanner: bannerUrl
      }, { merge: true });

      alert('হোম পেজ সফলভাবে আপডেট হয়েছে!');
    } catch (error) {
      console.error("Error saving home settings:", error);
      alert('সংরক্ষণ করতে সমস্যা হয়েছে!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#101828] text-white rounded-xl max-w-lg mx-auto font-sans">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">হোম পেজ কন্ট্রোল প্যানেল</h2>

      {/* নোটিশ টেক্সট ইনপুট */}
      <label className="block text-sm mb-1 text-gray-300">নোটিশ টেক্সট:</label>
      <input 
        type="text" 
        value={data.homeNotice} 
        onChange={e => setData({...data, homeNotice: e.target.value})} 
        placeholder="হোম পেজের নোটিশ লিখুন..."
        className="w-full p-2.5 bg-[#1a2234] border border-gray-700 rounded-lg mb-4 text-sm text-white" 
      />

      {/* বিজ্ঞাপন বা অফার টেক্সট ইনপুট */}
      <label className="block text-sm mb-1 text-gray-300">বিজ্ঞাপন বা অফার টেক্সট (Ads):</label>
      <input 
        type="text" 
        value={data.adText} 
        onChange={e => setData({...data, adText: e.target.value})} 
        placeholder="স্পেশাল অফার বা বিজ্ঞাপনের টেক্সট..."
        className="w-full p-2.5 bg-[#1a2234] border border-gray-700 rounded-lg mb-4 text-sm text-white" 
      />

      {/* ব্যানার ইমেজ ফাইল আপলোড */}
      <label className="block text-sm mb-1 text-gray-300">ব্যানার ইমেজ (Choose File):</label>
      <input 
        type="file" 
        accept="image/*"
        onChange={e => setBannerFile(e.target.files[0])} 
        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer mb-5" 
      />

      {/* স্লাইডার অন/অফ চেকবাক্স */}
      <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
        <input 
          type="checkbox" 
          checked={data.showSlider} 
          onChange={e => setData({...data, showSlider: e.target.checked})} 
          className="w-4 h-4 accent-red-600"
        />
        <span className="text-sm">হোম পেজে স্লাইডার অন রাখুন</span>
      </label>

      {/* সেভ বাটন */}
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-bold text-sm transition"
      >
        {loading ? 'সেভ হচ্ছে...' : 'সব পরিবর্তন সেভ করুন'}
      </button>
    </div>
  );
}
