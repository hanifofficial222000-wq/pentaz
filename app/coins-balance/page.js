'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function CoinBalancePage() {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserCoins() {
      // ইউজারের ফোন নম্বর লোকালস্টোরেজ থেকে নেওয়া
      const userPhone = localStorage.getItem('userPhone') || localStorage.getItem('phone') || "";

      if (!userPhone) {
        setCoins(0);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "users"), where("phone", "==", userPhone));
        const snap = await getDocs(q);

        if (!snap.empty) {
          snap.forEach(docSnap => {
            const userData = docSnap.data();
            const userCoins = userData.coins || userData.coinBalance || 0;
            setCoins(userCoins);
          });
        } else {
          setCoins(0);
        }
      } catch (err) {
        console.error(err);
        setCoins(0);
      } finally {
        setLoading(false);
      }
    }

    loadUserCoins();
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link href="/profile" className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg no-underline">
            ← ব্যাক
          </Link>
          <h2 className="text-lg font-bold text-slate-800">🪙 কয়েন ব্যালেন্স</h2>
          <div></div>
        </div>

        {/* Coin Box */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white text-center shadow-lg space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">আপনার বর্তমান কয়েন</p>
          <div className="text-4xl font-extrabold tracking-tight">
            {loading ? '🪙 ...' : `🪙 ${coins}`}
          </div>
          <p className="text-amber-100 text-xs pt-2">কেনাকাটায় এই কয়েনগুলো ব্যবহার করে আকর্ষণীয় ডিসকাউন্ট পেতে পারেন।</p>
        </div>

        {/* Info / History Note */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-700">📌 নিয়মাবলী:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>প্রতিটি সফল অর্ডারের পর নির্দিষ্ট পরিমাণ কয়েন যোগ হয়।</li>
            <li>কয়েনগুলো চেকআউট করার সময় ডিসকাউন্ট হিসেবে রিডিম করা যাবে।</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
