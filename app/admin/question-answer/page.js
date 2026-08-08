'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function CustomerSupportPage() {
  const [supportList, setSupportList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '' });
  const [replyTexts, setReplyTexts] = useState({});

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  const loadAdminSupportRequests = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "support"));
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSupportList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminSupportRequests();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplyTexts(prev => ({ ...prev, [id]: value }));
  };

  const sendReply = async (docId, currentReply) => {
    const replyText = replyTexts[docId] !== undefined ? replyTexts[docId] : currentReply;
    if (!replyText || !replyText.trim()) {
      alert("দয়া করে কিছু উত্তর লিখুন!");
      return;
    }

    try {
      const docRef = doc(db, "support", docId);
      await updateDoc(docRef, {
        reply: replyText.trim(),
        status: "Resolved"
      });

      showAlert("🎉 উত্তর সফলভাবে পাঠানো হয়েছে!");
      loadAdminSupportRequests();
    } catch (err) {
      console.error(err);
      alert("⚠️ উত্তর পাঠাতে সমস্যা হয়েছে!");
    }
  };

  const deleteQuestion = async (docId) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্ন এবং উত্তরটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "support", docId));
        showAlert("🗑️ সফলভাবে ডিলিট করা হয়েছে!");
        loadAdminSupportRequests();
      } catch (err) {
        console.error(err);
        alert("⚠️ ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-indigo-700 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-indigo-200 text-xs mt-1">কাস্টমার সাপোর্ট ও রিপ্লাই প্যানেল</p>
        </div>
        <Link href="/admin" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition no-underline">
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

        <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
          💬 কাস্টমারদের প্রশ্ন ও উত্তরের তালিকা
        </h3>

        {/* Questions & Support List Container */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              প্রশ্নসমূহ লোড হচ্ছে...
            </div>
          ) : supportList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              কোনো প্রশ্ন বা মেসেজ নেই।
            </div>
          ) : (
            supportList.map((item) => {
              const currentReply = item.reply || "";
              const customerPhone = item.customerPhone || "নম্বর নেই";
              const inputValue = replyTexts[item.id] !== undefined ? replyTexts[item.id] : currentReply;

              return (
                <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-500 font-semibold">
                    <span>📞 কাস্টমার ফোন: <strong className="text-slate-800">{customerPhone}</strong></span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">{item.status || 'Pending'}</span>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-100 text-slate-800 font-medium">
                    ❓ প্রশ্ন: {item.question || item.message}
                  </div>

                  {/* Reply Form */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block font-bold text-slate-700 text-[11px]">অ্যাডমিনের উত্তর লিখুন:</label>
                    <textarea 
                      rows="2" 
                      value={inputValue}
                      onChange={(e) => handleReplyChange(item.id, e.target.value)}
                      placeholder="এখানে উত্তর লিখুন..." 
                      className="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white text-black"
                    ></textarea>
                    
                    <div className="flex items-center justify-between pt-1">
                      <button 
                        onClick={() => sendReply(item.id, currentReply)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                      >
                        🚀 উত্তর পাঠান / আপডেট করুন
                      </button>
                      <button 
                        onClick={() => deleteQuestion(item.id)} 
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-2 rounded-lg text-xs transition cursor-pointer"
                      >
                        🗑️ ডিলিট প্রশ্ন
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
