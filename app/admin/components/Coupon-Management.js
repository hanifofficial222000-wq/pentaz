'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function CouponManagement() {
  const [couponCode, setCouponCode] = useState('');
  const [discountDetails, setDiscountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '' });
  const [coupons, setCoupons] = useState([]);

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // Load Coupons List
  const loadAdminCoupons = async () => {
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setCoupons(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdminCoupons();
  }, []);

  // Save Coupon (Public)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    const discount = discountDetails.trim();
    if (!code || !discount) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "coupons"), {
        code: code,
        discount: discount,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 কুপন সফলভাবে তৈরি করা হয়েছে!");
      setCouponCode('');
      setDiscountDetails('');
      loadAdminCoupons();
    } catch (err) {
      console.error(err);
      alert("⚠️ কুপন সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  // Delete Coupon
  const deleteCoupon = async (docId) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই কুপনটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "coupons", docId));
        showAlert("🗑️ কুপন সফলভাবে ডিলিট করা হয়েছে!");
        loadAdminCoupons();
      } catch (err) {
        console.error(err);
        alert("⚠️ ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">

      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-teal-700 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-teal-200 text-xs mt-1">কুপন ম্যানেজমেন্ট প্যানেল</p>
        </div>
        <Link href="/admin/control-room" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition no-underline">
          <span>⚙️ কন্ট্রোল রুম</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        
        {/* Alert Box */}
        {alert.show && (
          <div className="p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        {/* 1. CREATE COUPON */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
            🎁 নতুন কুপন তৈরি করুন (সবার জন্য)
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">কুপন কোড (যেমন: EID2026)</label>
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required 
                  placeholder="কোড লিখুন..." 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs uppercase text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ডিসকাউন্ট বিবরণ (যেমন: ২০% ছাড়)</label>
                <input 
                  type="text" 
                  value={discountDetails}
                  onChange={(e) => setDiscountDetails(e.target.value)}
                  required 
                  placeholder="ডিসকাউন্টের বিবরণ..." 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-black"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition text-xs cursor-pointer"
            >
              {loading ? "⏳ সেভ হচ্ছে..." : "🚀 কুপন তৈরি করুন"}
            </button>
          </form>
        </div>

        {/* 2. EXISTING COUPONS LIST */}
        <div className="bg-teal-50 p-5 rounded-xl border border-teal-200 shadow-sm">
          <h3 className="text-md font-bold text-teal-900 mb-3 flex items-center gap-2">
            📋 সকল অ্যাক্টিভ কুপনসমূহ
          </h3>
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <p className="text-xs text-slate-500">কোনো কুপন নেই।</p>
            ) : (
              coupons.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded-md">{item.code}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">সবার জন্য প্রযোজ্য</span>
                    </div>
                    <p className="text-slate-700 font-semibold mt-1">{item.discount}</p>
                  </div>
                  <button 
                    onClick={() => deleteCoupon(item.id)} 
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                  >
                    🗑️ ডিলিট
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

