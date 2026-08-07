'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionInput, setQuestionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userPhone, setUserPhone] = useState('Guest_User');

  useEffect(() => {
    const phone = localStorage.getItem('userPhone') || localStorage.getItem('phone') || "Guest_User";
    setUserPhone(phone);
  }, []);

  // প্রশ্ন লোড করার ফাংশন
  const loadCustomerQuestions = useCallback(async (phone) => {
    if (!phone) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "support"), 
        where("customerPhone", "==", phone)
      );

      const snap = await getDocs(q);
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      setQuestions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userPhone) {
      loadCustomerQuestions(userPhone);
    }
  }, [userPhone, loadCustomerQuestions]);

  // নতুন প্রশ্ন সাবমিট করার হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    const questionText = questionInput.trim();
    if (!questionText) return;

    setSubmitting(true);

    try {
      await addDoc(collection(db, "support"), {
        customerPhone: userPhone,
        question: questionText,
        status: "Pending",
        reply: "",
        createdAt: serverTimestamp()
      });

      setQuestionInput("");
      alert("🎉 আপনার প্রশ্ন সফলভাবে জমা হয়েছে!");
      loadCustomerQuestions(userPhone);
    } catch (err) {
      console.error(err);
      alert("⚠️ প্রশ্ন জমা দিতে সমস্যা হয়েছে!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link href="/profile" className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg no-underline">
            ← ব্যাক
          </Link>
          <h2 className="text-lg font-bold text-slate-800">💬 আমার প্রশ্নসমূহ</h2>
          <div></div>
        </div>

        {/* Ask Question Form (প্রশ্ন করার বক্স) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700">নতুন প্রশ্ন বা জিজ্ঞাসা পাঠান:</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea 
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              rows="3" 
              required 
              placeholder="আপনার প্রশ্ন বা মতামত এখানে লিখুন..." 
              className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white text-black"
            ></textarea>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? "⏳ পাঠানো হচ্ছে..." : "🚀 প্রশ্ন জমা দিন"}
            </button>
          </form>
        </div>

        {/* Questions Container */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              প্রশ্ন লোড হচ্ছে...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              আপনার কোনো প্রশ্ন নেই।
            </div>
          ) : (
            questions.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>প্রশ্ন আইডি: #{item.id.slice(0, 6)}</span>
                  <span className="text-amber-500 font-bold">স্ট্যাটাস: {item.status || 'Pending'}</span>
                </div>
                <p className="text-slate-800 font-semibold text-sm">❓ {item.question || item.message}</p>
                
                {item.reply ? (
                  <div className="mt-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                    <p className="font-bold mb-1">👑 অ্যাডমিনের উত্তর:</p>
                    <p>{item.reply}</p>
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] text-amber-600 font-semibold bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    ⏳ অ্যাডমিন এখনও উত্তর দেননি।
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
