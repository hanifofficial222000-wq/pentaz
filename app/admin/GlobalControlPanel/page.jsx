'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function GlobalControlPanel() {
  const [config, setConfig] = useState({
    siteName: '',
    currency: '',
    phoneNumber: '',
    isMaintenance: false,
    announcementText: '',
    showPopup: false,
    popupMessage: '',
    productCardSize: 'normal'
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ফায়ারবেস থেকে বর্তমান সেটিংস লোড করা
  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, 'settings', 'globalConfig');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // ফায়ারবেসে ডেটা আপডেট করার ফাংশন
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const docRef = doc(db, 'settings', 'globalConfig');
      await updateDoc(docRef, config);
      alert('সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error("Error updating config: ", error);
      alert('আপডেট করতে সমস্যা হয়েছে!');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white bg-slate-900 min-h-screen text-center">লোড হচ্ছে...</div>;
  }

  return (
    <div className="p-6 text-white bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Global Control Panel</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4 max-w-xl bg-slate-800 p-6 rounded-2xl border border-slate-700">
        
        {/* সাইটের নাম */}
        <div>
          <label className="block text-xs font-bold mb-1">সাইটের নাম (Site Name):</label>
          <input 
            type="text" 
            value={config.siteName || ''} 
            onChange={(e) => setConfig({...config, siteName: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          />
        </div>

        {/* কারেন্সি */}
        <div>
          <label className="block text-xs font-bold mb-1">কারেন্সি (Currency):</label>
          <input 
            type="text" 
            value={config.currency || ''} 
            onChange={(e) => setConfig({...config, currency: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          />
        </div>

        {/* ফোন নম্বর */}
        <div>
          <label className="block text-xs font-bold mb-1">যোগাযোগের ফোন নম্বর:</label>
          <input 
            type="text" 
            value={config.phoneNumber || ''} 
            onChange={(e) => setConfig({...config, phoneNumber: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          />
        </div>

        {/* মেইনটেনেন্স মোড */}
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700">
          <label className="text-xs font-bold">মেইনটেনেন্স মোড (Maintenance Mode):</label>
          <input 
            type="checkbox" 
            checked={config.isMaintenance || false} 
            onChange={(e) => setConfig({...config, isMaintenance: e.target.checked})}
            className="w-5 h-5 accent-red-600 cursor-pointer"
          />
        </div>

        {/* বিজ্ঞপ্তির টেক্সট */}
        <div>
          <label className="block text-xs font-bold mb-1">বিজ্ঞপ্তি বা অ্যানাউন্সমেন্ট টেক্সট:</label>
          <input 
            type="text" 
            value={config.announcementText || ''} 
            onChange={(e) => setConfig({...config, announcementText: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          />
        </div>

        {/* পপআপ স্ট্যাটাস টগল */}
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700">
          <label className="text-xs font-bold">পপআপ নোটিশ দেখাবেন কি না (Show Popup):</label>
          <input 
            type="checkbox" 
            checked={config.showPopup || false} 
            onChange={(e) => setConfig({...config, showPopup: e.target.checked})}
            className="w-5 h-5 accent-red-600 cursor-pointer"
          />
        </div>

        {/* পপআপ মেসেজ */}
        <div>
          <label className="block text-xs font-bold mb-1">পপআপ নোটিশ মেসেজ:</label>
          <textarea 
            rows="3"
            value={config.popupMessage || ''} 
            onChange={(e) => setConfig({...config, popupMessage: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          />
        </div>

        {/* প্রডাক্ট কার্ড সাইজ অপশন */}
        <div>
          <label className="block text-xs font-bold mb-1">প্রডাক্ট কার্ড সাইজ:</label>
          <select 
            value={config.productCardSize || 'normal'} 
            onChange={(e) => setConfig({...config, productCardSize: e.target.value})}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
          >
            <option value="normal">Normal (স্বাভাবিক)</option>
            <option value="compact">Compact (ছোট)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={updating}
          className="w-full bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 rounded-xl font-bold cursor-pointer shadow-lg"
        >
          {updating ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
        </button>
      </form>
    </div>
  );
}
