'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // ফর্মের স্টেটসমূহ
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('ডিসকাউন্ট অফার');
  const [description, setDescription] = useState('');
  const [expireDate, setExpireDate] = useState('');

  // ফায়ারবেস থেকে সব কুপন লোড করা
  const fetchCoupons = async () => {
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCoupons(list);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // নতুন কুপন অ্যাড করার হ্যান্ডলার
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discount) {
      setMessage('⚠️ কুপন কোড এবং ডিসকাউন্ট পরিমাণ অবশ্যই দিতে হবে!');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await addDoc(collection(db, "coupons"), {
        code: code.trim().toUpperCase(),
        discount: discount.trim(),
        type: type.trim(),
        description: description.trim(),
        expireDate: expireDate || '',
        createdAt: new Date().toISOString()
      });

      setMessage('✅ সফলভাবে নতুন কুপন যুক্ত করা হয়েছে!');
      // ফর্ম রিসেট করা
      setCode('');
      setDiscount('');
      setDescription('');
      setExpireDate('');
      
      // লিস্ট রিফ্রেশ করা
      fetchCoupons();
    } catch (err) {
      console.error("Error adding coupon:", err);
      setMessage('❌ কুপন সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  // কুপন ডিলিট করার হ্যান্ডলার
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই কুপনটি ডিলিট করতে চান?')) return;

    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter(item => item.id !== id));
      setMessage('🗑️ কুপনটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert('ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-extrabold text-slate-800 m-0">🛠️ অ্যাডমিন প্যানেল: কুপন ম্যানেজমেন্ট</h1>
          <p className="text-xs text-slate-500 mt-1">নতুন কুপন তৈরি করুন এবং বর্তমান কুপনগুলো নিয়ন্ত্রণ করুন।</p>
        </div>

        {/* Status Message */}
        {message && (
          <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-bold text-center shadow-md">
            {message}
          </div>
        )}

        {/* Add Coupon Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 m-0 border-b border-slate-100 pb-3">➕ নতুন কুপন তৈরি করুন</h2>
          
          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কুপন কোড (যেমন: EID50)</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="COUPON2026" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ডিসকাউন্ট পরিমাণ (যেমন: ১০০ টাকা / ২০%)</label>
                <input 
                  type="text" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)} 
                  placeholder="১০০ টাকা ছাড়" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কুপনের ধরন</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="ডিসকাউন্ট অফার">ডিসকাউন্ট অফার</option>
                  <option value="ফ্রি শিপিং">ফ্রি শিপিং</option>
                  <option value="স্পেশাল অফার">স্পেশাল অফার</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মেয়াদের শেষ তারিখ (ঐচ্ছিক)</label>
                <input 
                  type="date" 
                  value={expireDate} 
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শর্ত বা বিবরণ (ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="মিনিমাম ৫০০ টাকা কেনাকাটায় প্রযোজ্য" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer border-none disabled:bg-slate-300"
            >
              {submitting ? '⏳ সেভ হচ্ছে...' : '✨ কুপন পাবলিশ করুন'}
            </button>
          </form>
        </div>

        {/* Existing Coupons List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 m-0 border-b border-slate-100 pb-3">📋 বর্তমান কুপন তালিকা ({coupons.length})</h2>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs animate-pulse">লোড হচ্ছে...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">কোনো কুপন ডেটাবেসে নেই।</div>
          ) : (
            <div className="space-y-3">
              {coupons.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{item.code}</span>
                      <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded">{item.discount}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">{item.description || item.type}</p>
                    {item.expireDate && <p className="text-[10px] text-slate-400 m-0">মেয়াদ: {item.expireDate}</p>}
                  </div>

                  <button 
                    onClick={() => handleDeleteCoupon(item.id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-2 rounded-lg border border-rose-200 transition cursor-pointer"
                  >
                    🗑️ ডিলিট
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
