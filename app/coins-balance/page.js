'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function CoinBalancePage() {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      // ইউজারের ফোন নম্বর লোকালস্টোরেজ থেকে নেওয়া
      const phone = localStorage.getItem('userPhone') || localStorage.getItem('phone') || "";
      setUserPhone(phone);

      if (!phone) {
        setCoins(0);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "users"), where("phone", "==", phone));
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

    loadUserData();
  }, []);

  // রেফারেল লিংক তৈরি করার ফাংশন
  const getReferralLink = () => {
    if (!userPhone) return typeof window !== 'undefined' ? window.location.origin : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/reward?ref=${userPhone}`;
  };

  // লিংক কপি করার ফাংশন
  const handleCopyLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // হোয়াটসঅ্যাপে শেয়ার করার ফাংশন
  const handleWhatsAppShare = () => {
    const link = getReferralLink();
    const text = `🛍️ আয়াাত শপ থেকে কেনাকাটা করুন এবং এই লিংকে ক্লিক করে ফ্রি কয়েন অর্জন করুন!\n\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link href="/profile" className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg no-underline">
            ← ব্যাক
          </Link>
          <h2 className="text-lg font-bold text-slate-800">🪙 কয়েন ব্যালেন্স ও রেফারেল</h2>
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

        {/* Referral Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <p className="font-bold text-slate-700 text-xs">🔗 আপনার রেফারেল লিংক:</p>
          
          {userPhone ? (
            <div className="space-y-2.5">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 break-all select-all font-mono">
                {getReferralLink()}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleCopyLink}
                  className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {copied ? '✅ কপি হয়েছে!' : '📋 লিংক কপি করুন'}
                </button>

                <button 
                  onClick={handleWhatsAppShare}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  💬 শেয়ার করুন
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500 font-medium">
              রেফারেল লিংক পেতে অনুগ্রহ করে আপনার প্রোফাইল বা অর্ডার পেজ থেকে ফোন নম্বর সেট করুন।
            </p>
          )}
        </div>

        {/* Info / History Note */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-700">📌 নিয়মাবলী:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>আপনার রেফারেল লিংকে কেউ ক্লিক করলে ১০ কয়েন পাবেন।</li>
            <li>প্রতিটি সফল অর্ডারের পর নির্দিষ্ট পরিমাণ কয়েন যোগ হয়।</li>
            <li>কয়েনগুলো চেকআউট করার সময় ডিসকাউন্ট হিসেবে রিডিম করা যাবে।</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
