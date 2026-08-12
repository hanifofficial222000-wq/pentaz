'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// গ্লোবাল ব্যানার কম্পোনেন্ট
export function GlobalBanner({ type = 'top', message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    top: 'bg-[#e63946] text-white py-2 px-4 text-xs font-medium text-center',
    bottom: 'bg-[#333] text-white py-3 px-4 text-xs rounded-xl shadow-md my-4 text-center mx-4',
  };

  return (
    <div className={`flex justify-between items-center max-w-md mx-auto ${styles[type] || styles.top}`}>
      <span className="flex-1">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }} 
        className="bg-transparent border-none text-inherit font-bold cursor-pointer text-sm ml-2 p-1"
      >
        ✕
      </button>
    </div>
  );
}

// ১. মূল এক্সপোর্ট করা পেজ কম্পোনেন্ট যা Suspense বাউন্ডারি দিয়ে মোড়ানো থাকবে
export default function MyCouponsPage({ 
  globalTopBanner = '🎟️ যেকোনো কুপন কোড ব্যবহার করে লুফে নিন নিশ্চিত ডিসকাউন্ট!', 
  globalBottomBanner = '📢 নিয়মিত নতুন নতুন অফার ও কুপন পেতে আয়াাত শপের সাথেই থাকুন।' 
}) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">লোড হচ্ছে...</div>}>
      <CouponsContent globalTopBanner={globalTopBanner} globalBottomBanner={globalBottomBanner} />
    </Suspense>
  );
}

// ২. আসল কুপন লজিক এবং ইউজার ইন্টারফেস কম্পোনেন্ট
function CouponsContent({ globalTopBanner, globalBottomBanner }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopPopup, setShowTopPopup] = useState(true);

  useEffect(() => {
    async function loadCustomerCoupons() {
      try {
        const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          setCoupons([]);
        } else {
          const couponList = [];
          snap.forEach(docSnap => {
            couponList.push({ id: docSnap.id, ...docSnap.data() });
          });
          setCoupons(couponList);
        }
      } catch (err) {
        console.error(err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerCoupons();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`কুপন কোড কপি হয়েছে: ${code}`);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      
      {/* গ্লোবাল টপ ব্যানার স্লট */}
      {showTopPopup && (
        <div className="mb-4">
          <GlobalBanner 
            type="top" 
            message={globalTopBanner} 
            onClose={() => setShowTopPopup(false)} 
          />
        </div>
      )}

      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link 
            href="/profile" 
            className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg no-underline"
          >
            ← ব্যাক
          </Link>
          <h2 className="text-lg font-bold text-slate-800">🎟️ আমার কুপনসমূহ</h2>
          <div></div>
        </div>

        {/* Coupons Container */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              কুপন লোড হচ্ছে...
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              বর্তমানে কোনো কুপন উপলব্ধ নেই।
            </div>
          ) : (
            coupons.map((item) => (
              <div 
                key={item.id}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-xl shadow-md space-y-1.5 relative overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-bold">সবার জন্য প্রযোজ্য</span>
                  <span className="text-xs font-semibold opacity-90">{item.discount}</span>
                </div>
                <div className="text-lg font-extrabold tracking-wider">{item.code}</div>
                <button 
                  onClick={() => copyToClipboard(item.code)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition cursor-pointer border-none"
                >
                  📋 কপি কোড
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* গ্লোবাল বটম ব্যানার স্লট */}
      <GlobalBanner type="bottom" message={globalBottomBanner} />

    </div>
  );
}
