'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminNotificationSender() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert("দয়া করে টাইটেল এবং মেসেজ লিখুন!");
      return;
    }

    setSending(true);

    try {
      // ১. ডেটাবেজ থেকে সমস্ত ইউজারের FCM টোকেনগুলো নিয়ে আসা
      const tokenSnap = await getDocs(collection(db, "fcm_tokens"));
      const tokens = tokenSnap.docs.map(doc => doc.data().token);

      if (tokens.length === 0) {
        alert("⚠️ কোনো ইউজারের নোটিফিকেশন টোকেন পাওয়া যায়নি!");
        setSending(false);
        return;
      }

      // ২. এপিআই (API Route) এর মাধ্যমে সব টোকেনে নোটিফিকেশন পাঠানো
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, title, body, imageUrl })
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 সফলভাবে সব ইউজারের কাছে নোটিফিকেশন পাঠানো হয়েছে!");
        setTitle('');
        setBody('');
        setImageUrl('');
      } else {
        alert("⚠️ নোটিফিকেশন পাঠাতে সমস্যা হয়েছে: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ সার্ভার এরর!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl mx-auto my-6 border border-slate-200 font-sans">
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        📢 কাস্টম পুশ নোটিফিকেশন ব্রডকাস্ট প্যানেল
      </h3>
      
      <form onSubmit={handleSendBroadcast} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">নোটিফিকেশনের শিরোনাম (Title)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: বিশেষ অফার বা ডিসকাউন্ট!" 
            required 
            className="w-full border border-slate-300 p-2.5 rounded-lg text-xs outline-none focus:border-red-500 text-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">মেসেজ বা বিবরণ (Body)</label>
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="বিস্তারিত লিখুন..." 
            rows="3"
            required 
            className="w-full border border-slate-300 p-2.5 rounded-lg text-xs outline-none focus:border-red-500 text-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">ব্যানার বা ছবির লিংক (Image URL - ঐচ্ছিক)</label>
          <input 
            type="url" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/banner.jpg" 
            className="w-full border border-slate-300 p-2.5 rounded-lg text-xs outline-none focus:border-red-500 text-black"
          />
        </div>

        <button 
          type="submit" 
          disabled={sending}
          className={`w-full text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer ${sending ? 'bg-gray-400' : 'bg-slate-800 hover:bg-slate-900'}`}
        >
          {sending ? 'পাঠানো হচ্ছে, অপেক্ষা করুন...' : '🚀 সব ইউজারের কাছে নোটিফিকেশন পাঠান'}
        </button>
      </form>
    </div>
  );
}
