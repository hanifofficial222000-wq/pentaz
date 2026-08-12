'use client';
import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function HomeEditor() {
  const [data, setData] = useState({ 
    newFeatureTitle: '', 
    newFeatureBanner: '' 
  });
  const [featureFile, setFeatureFile] = useState(null);
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
      let bannerUrl = data.newFeatureBanner;

      // নতুন ফাইল সিলেক্ট করা থাকলে ফায়ারবেস স্টোরেজে আপলোড হবে
      if (featureFile) {
        const fileRef = ref(storage, `home/feature_${Date.now()}_${featureFile.name}`);
        await uploadBytes(fileRef, featureFile);
        bannerUrl = await getDownloadURL(fileRef);
      }

      // ফায়ারস্টোর ডাটাবেজে ডেটা সেভ করা
      await setDoc(doc(db, "home_settings", "main"), {
        ...data,
        newFeatureBanner: bannerUrl
      }, { merge: true });

      alert('নতুন ফিচার সফলভাবে আপডেট হয়েছে!');
    } catch (error) {
      console.error("Error saving feature settings:", error);
      alert('সংরক্ষণ করতে সমস্যা হয়েছে!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#101828] text-white rounded-xl max-w-lg mx-auto font-sans shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-red-500">
        ✨ নতুন ফিচার কন্ট্রোল প্যানেল
      </h2>

      {/* ফিচারের শিরোনাম ইনপুট */}
      <label className="block text-sm mb-1 text-gray-300">ফিচারের শিরোনাম (Title):</label>
      <input 
        type="text" 
        value={data.newFeatureTitle} 
        onChange={e => setData({...data, newFeatureTitle: e.target.value})} 
        placeholder="নতুন ফিচারের নাম লিখুন..."
        className="w-full p-2.5 bg-[#1a2234] border border-gray-700 rounded-lg mb-4 text-sm text-white" 
      />

      {/* ফিচারের ব্যানার ইমেজ ফাইল আপলোড */}
      <label className="block text-sm mb-1 text-gray-300">ফিচারের ব্যানার ইমেজ (Choose File):</label>
      <input 
        type="file" 
        accept="image/*"
        onChange={e => setFeatureFile(e.target.files[0])} 
        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer mb-5" 
      />

      {/* সেভ বাটন */}
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-bold text-sm transition"
      >
        {loading ? 'সেভ হচ্ছে...' : 'নতুন ফিচার সেভ করুন'}
      </button>
    </div>
  );
}
