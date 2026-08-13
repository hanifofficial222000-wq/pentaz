'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function MyCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filter, setFilter] = useState('all'); // all, discount, shipping

  useEffect(() => {
    async function loadCoupons() {
      try {
        const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          setCoupons([]);
        } else {
          const list = [];
          const now = new Date();

          snap.forEach(docSnap => {
            const data = docSnap.data();
            // মেয়াদ ঠিক থাকলে লিস্টে যোগ করা
            if (!data.expireDate || new Date(data.expireDate) >= now) {
              list.push({ id: docSnap.id, ...data });
            }
          });
          setCoupons(list);
        }
      } catch (err) {
        console.error("Coupon load error:", err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }

    loadCoupons();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // ফিল্টার অনুযায়ী কুপন আলাদা করা
  const filteredCoupons = coupons.filter(item => {
    if (filter === 'shipping') return item.type && item.type.toLowerCase().includes('shipping');
    if (filter === 'discount') return !item.type || !item.type.toLowerCase().includes('shipping');
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link 
            href="/profile" 
            className="text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl no-underline transition"
          >
            ← ব্যাক
          </Link>
          <h2 className="text-base font-extrabold text-slate-800 m-0">🎟️ আমার কুপনসমূহ</h2>
          <div className="w-10"></div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition border-none cursor-pointer ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 bg-transparent'}`}
          >
            সব কুপন
          </button>
          <button 
            onClick={() => setFilter('discount')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition border-none cursor-pointer ${filter === 'discount' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 bg-transparent'}`}
          >
            ডিসকাউন্ট
          </button>
          <button 
            onClick={() => setFilter('shipping')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition border-none cursor-pointer ${filter === 'shipping' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 bg-transparent'}`}
          >
            ফ্রি ডেলিভারি
          </button>
        </div>

        {/* Coupons List */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-pulse">
              ⏳ কুপন লোড হচ্ছে...
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="font-semibold text-slate-600">এই ক্যাটাগরিতে কোনো কুপন নেই।</p>
            </div>
          ) : (
            filteredCoupons.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative transition hover:border-red-200 hover:shadow-md"
              >
                {/* Top Badge Section */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-white flex justify-between items-center">
                  <span className="text-[10px] bg-black/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {item.type || 'ডিসকাউন্ট অফার'}
                  </span>
                  <span className="text-xs font-extrabold tracking-wide">{item.discount}</span>
                </div>

                {/* Content Section */}
                <div className="p-4 flex justify-between items-center gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-base font-mono font-extrabold text-slate-800 tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg inline-block border border-slate-200">
                      {item.code}
                    </div>
                    
                    <p className="text-[11px] text-slate-500 m-0 truncate">
                      {item.description || 'শপের যেকোনো পণ্যে ব্যবহারযোগ্য'}
                    </p>

                    {item.expireDate && (
                      <p className="text-[10px] text-rose-500 font-medium m-0 pt-0.5">
                        ⏳ মেয়াদ শেষ: {new Date(item.expireDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => copyToClipboard(item.code)}
                    className="bg-[#d9363e] hover:bg-[#b52b32] text-white text-[11px] font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition shrink-0 cursor-pointer border-none flex items-center gap-1"
                  >
                    {copiedCode === item.code ? '✅ কপিড' : '📋 কপি'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
