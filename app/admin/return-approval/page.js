'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function ReturnsManagementPage() {
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '' });

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  const loadAdminReturns = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "returns"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReturnsList(list);
    } catch (err) {
      console.error("Error loading returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminReturns();
  }, []);

  const updateReturnStatus = async (docId, newStatus) => {
    try {
      await updateDoc(doc(db, "returns", docId), { status: newStatus });
      showAlert(`🎉 রিটার্ন রিকোয়েস্ট '${newStatus}' করা হয়েছে!`);
      loadAdminReturns();
    } catch (err) {
      console.error(err);
      alert("⚠️ স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!");
    }
  };

  const deleteReturnRecord = async (docId) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই রিটার্ন রিকোয়েস্টটি চিরতরে ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "returns", docId));
        showAlert("🗑️ রিটার্ন রিকোয়েস্ট সফলভাবে ডিলিট করা হয়েছে!");
        loadAdminReturns();
      } catch (err) {
        console.error(err);
        alert("⚠️ ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-red-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-red-200 text-xs mt-1">অ্যাডমিন রিটার্ন ম্যানেজমেন্ট প্যানেল</p>
        </div>
        <Link href="/admin" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer no-underline">
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

        {/* RETURNS MANAGEMENT */}
        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm">
          <h3 className="text-lg font-bold text-red-900 mb-1 flex items-center gap-2">
            🔄 কাস্টমার রিটার্ন রিকোয়েস্টসমূহ
          </h3>
          <p className="text-xs text-red-700 mb-4">কাস্টমারদের পাঠানো রিটার্ন ও রিফান্ড রিকোয়েস্টগুলো ম্যানেজ করুন:</p>

          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-400">রিটার্ন রিকোয়েস্ট লোড হচ্ছে...</p>
            ) : returnsList.length === 0 ? (
              <p className="text-xs text-slate-500">কোনো রিটার্ন রিকোয়েস্ট নেই।</p>
            ) : (
              returnsList.map((item) => {
                let statusBg = 'bg-amber-100 text-amber-800';
                if (item.status === 'Approved') statusBg = 'bg-emerald-100 text-emerald-700';
                else if (item.status === 'Cancelled') statusBg = 'bg-red-100 text-red-700';

                let productImg = item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/60?text=No+Image';

                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <a href={productImg} target="_blank" rel="noopener noreferrer" title="বড় করে দেখুন">
                          <img src={productImg} className="w-14 h-14 rounded-lg object-cover border border-slate-300 shadow-sm hover:opacity-90 transition" alt="Product Image" />
                        </a>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">প্রোডাক্ট আইডি: #{item.productId}</h4>
                          <p className="text-[11px] text-red-600 font-bold">নাম: {item.customerName}</p>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${statusBg}`}>{item.status || 'Pending'}</span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border">
                      <p>📞 <b>ফোন:</b> <a href={`https://wa.me/${item.customerPhone}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">{item.customerPhone}</a></p>
                      <p>⚠️ <b>কারণ:</b> {item.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button onClick={() => updateReturnStatus(item.id, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer text-center">✅ Approve (গ্রহণ)</button>
                      <button onClick={() => updateReturnStatus(item.id, 'Cancelled')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer text-center">❌ Cancel (বাতিল)</button>
                    </div>

                    <button onClick={() => deleteReturnRecord(item.id)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-2 rounded-lg transition cursor-pointer text-center">🗑️ ডিলিট করুন (Delete)</button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
