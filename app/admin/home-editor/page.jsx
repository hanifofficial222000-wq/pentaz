'use client';
import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function HomeEditor() {
  // নতুন আলাদা ফিচারের জন্য স্টেট
  const [data, setData] = useState({ 
    newFeatureTitle: '', 
    newFeatureBanner: '' 
  });
  const [featureFile, setFeatureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "home_settings", "main"));
      if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
    }
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    let bannerUrl = data.newFeatureBanner;

    if (featureFile) {
      const fileRef = ref(storage, `home/new_feature_${Date.now()}`);
      await uploadBytes(fileRef, featureFile);
      bannerUrl = await getDownloadURL(fileRef);
    }

    await setDoc(doc(db, "home_settings", "main"), {
      ...data,
      newFeatureBanner: bannerUrl
    }, { merge: true });

    setLoading(false);
    alert('নতুন ফিচার সফলভাবে আপডেট হয়েছে!');
  };

  return (
    <div className="p-6 bg-[#101828] text-white rounded-xl max-w-lg mx-auto mt-5">
      <h2 className="text-xl font-bold mb-4 text-red-500">✨ নতুন ফিচার কন্ট্রোল প্যানেল</h2>

      <label className="block text-sm mb-1">ফিচারের শিরোনাম (Title):</label>
      <input 
        type="text" 
        value={data.newFeatureTitle} 
        onChange={e => setData({...data, newFeatureTitle: e.target.value})} 
        placeholder="নতুন ফিচারের নাম লিখুন..."
        className="w-full p-2.5 bg-[#1a2234] rounded mb-4 text-sm" 
      />

      <label className="block text-sm mb-1">ফিচারের ব্যানার (Choose File):</label>
      <input 
        type="file" 
        accept="image/*"
        onChange={e => setFeatureFile(e.target.files[0])} 
        className="w-full mb-4 text-sm" 
      />

      <button onClick={handleSave} disabled={loading} className="w-full bg-red-600 p-3 rounded font-bold text-sm">
        {loading ? 'সেভ হচ্ছে...' : 'নতুন ফিচার সেভ করুন'}
      </button>
    </div>
  );
}
