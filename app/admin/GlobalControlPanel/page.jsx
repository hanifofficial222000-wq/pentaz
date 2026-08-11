'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function GlobalControlPanel() {
  const [settings, setSettings] = useState({
    siteName: 'Ayaat Shop',
    announcementText: '',
    showAnnouncement: false,
    showFlashSale: true,
    showBestSellers: true,
    showPromoBanners: true,
    maintenanceMode: false,
    customFeatureTitle: '',
    customFeatureContent: '',
    isCustomFeatureActive: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '' });

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // ডেটাবেজ থেকে বর্তমান সেটিংস লোড করা
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'globalConfig');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'globalConfig');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });

      showAlert("🚀 গ্লোবাল সেটিংস এবং ফিচার সফলভাবে আপডেট করা হয়েছে!");
    } catch (err) {
      console.error("Save error:", err);
      alert("⚠️ সেটিংস সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-xs font-bold text-gray-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        
        <div className="border-b pb-4">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            ⚙️ গ্লোবাল ফিচার ও সাইট কন্ট্রোল প্যানেল
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            এই প্যানেল থেকে পুরো ওয়েবসাইটের যেকোনো সেকশন বা নতুন ফিচার কোড পরিবর্তন ছাড়াই নিয়ন্ত্রণ করতে পারবেন।
          </p>
        </div>

        {alert.show && (
          <div className="p-4 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* ১. জেনারেল কনফিগারেশন */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">📌 ১. বেসিক সাইট কনফিগারেশন</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ওয়েবসাইটের নাম</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs text-black bg-white"
              />
            </div>
          </div>

          {/* ২. রানিং অ্যানাউন্সমেন্ট বার কন্ট্রোল */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">📢 ২. অ্যানাউন্সমেন্ট বা নোটিশ বার কন্ট্রোল</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">নোটিশ বার অন/অফ করুন</span>
              <input 
                type="checkbox"
                checked={settings.showAnnouncement}
                onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>
            {settings.showAnnouncement && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">নোটিশের টেক্সট</label>
                <input 
                  type="text" 
                  value={settings.announcementText}
                  onChange={(e) => handleChange('announcementText', e.target.value)}
                  placeholder="যেমন: ঈদে বিশেষ ছাড় চলছে!"
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs text-black bg-white"
                />
              </div>
            )}
          </div>

          {/* ৩. হোমপেজ সেকশন ভিজিবিলিটি টগল */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">👁️ ৩. হোমপেজ সেকশন ভিজিবিলিটি (অন/অফ সুইচ)</h3>
            
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600">⚡ ফ্ল্যাশ সেল সেকশন দেখাবেন?</span>
              <input 
                type="checkbox"
                checked={settings.showFlashSale}
                onChange={(e) => handleChange('showFlashSale', e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600">🔥 বেস্ট সেলার সেকশন দেখাবেন?</span>
              <input 
                type="checkbox"
                checked={settings.showBestSellers}
                onChange={(e) => handleChange('showBestSellers', e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-600">🖼️ প্রমোশনাল ব্যানার স্লাইডার দেখাবেন?</span>
              <input 
                type="checkbox"
                checked={settings.showPromoBanners}
                onChange={(e) => handleChange('showPromoBanners', e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* ৪. ডাইনামিক কাস্টম ফিচার ইনজেকশন */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">✨ ৪. নতুন কাস্টম ফিচার / উইজেট যোগ করুন</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">এই ফিচারটি সাইটে সক্রিয় করুন</span>
              <input 
                type="checkbox"
                checked={settings.isCustomFeatureActive}
                onChange={(e) => handleChange('isCustomFeatureActive', e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ফিচারের শিরোনাম (Title)</label>
              <input 
                type="text" 
                value={settings.customFeatureTitle}
                onChange={(e) => handleChange('customFeatureTitle', e.target.value)}
                placeholder="যেমন: মেগা উইন্টার অফার"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ফিচারের বিবরণ বা বিস্তারিত</label>
              <textarea 
                value={settings.customFeatureContent}
                onChange={(e) => handleChange('customFeatureContent', e.target.value)}
                placeholder="ফিচার সম্পর্কিত বিবরণ লিখুন..."
                rows={3}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-xs text-black bg-white"
              />
            </div>
          </div>

          {/* ৫. মেইনটেন্যান্স মোড */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-red-700">🛠️ মেইনটেন্যান্স মোড (Maintenance Mode)</h4>
              <p className="text-[10px] text-red-500">চালু করলে পুরো সাইটে মেইনটেন্যান্স পেজ দেখাবে।</p>
            </div>
            <input 
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 accent-red-600 cursor-pointer"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className={`w-full text-white font-bold py-3 rounded-xl transition duration-200 text-xs shadow-md ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black cursor-pointer'}`}
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সমস্ত সেটিংস ও ফিচার সেভ করুন'}
          </button>

        </form>
      </div>
    </div>
  );
}
