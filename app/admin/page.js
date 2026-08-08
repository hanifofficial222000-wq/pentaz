'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // আপনার ফায়ারবেস কনফিগ পাথ ঠিক করে নিন
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminControlRoom() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // লগইন ফর্ম স্টেট
  const [email, setEmail] = useState('admin@ayaatshop.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ফায়ারবেস অথ স্টেট চেকার
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // হ্যান্ডেল লগইন
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setErrorMsg('লগইন ব্যর্থ হয়েছে! সঠিক পাসওয়ার্ড দিন। (টেস্ট ইমেইল: admin@ayaatshop.com)');
    }
  };

  // হ্যান্ডেল লগআউট
  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500 mx-auto mb-3"></div>
          <p className="text-sm text-slate-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // যদি অ্যাডমিন লগইন করা না থাকে, তবে লগইন স্ক্রিন দেখাবে
  if (!user) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest">
              Restricted Area
            </span>
            <h1 className="text-2xl font-extrabold tracking-wide mt-3">Admin Login</h1>
            <p className="text-slate-400 text-xs mt-1">AYAAT SPORT SHOP Control Room</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড দিন"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500 text-white"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              লগইন করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  // লগইন সফল হলে মূল অ্যাডমিন কন্ট্রোল রুম ড্যাশবোর্ড দেখাবে
  return (
    <div className="bg-slate-900 text-white min-h-screen py-8 px-4 md:px-8 font-sans">

      {/* Control Room Header Banner */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest">
            Master Admin Control ({user.email})
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide mt-2">AYAAT SPORT SHOP</h1>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 backdrop-blur-md transition duration-200 flex items-center gap-2 shadow-lg no-underline">
            <span>🌐 মূল সাইট ভিজিট</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold py-2.5 px-4 rounded-xl border border-red-500/30 transition duration-200 cursor-pointer shadow-lg"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* Navigation Grid / Control Panel */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

        {/* 1. Product Customize */}
        <Link href="/admin/product-costumize" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-red-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">⚙️</div>
            <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition">Product Customize</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-red-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 2. Product Approval */}
        <Link href="/admin/product-approval" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">⏳</div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">Product Approval</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-amber-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 3. Banner Management */}
        <Link href="/admin/banner" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🖼️</div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">Banner Management</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-purple-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 4. Customer Support */}
        <Link href="/admin/costumer-spurt" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">💬</div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">Customer Support</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-indigo-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 5. Orders Management */}
        <Link href="/admin/order" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📦</div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">Orders Management</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-blue-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 6. Product Offers */}
        <Link href="/admin/product-offer" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🏷️</div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Product Offers</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-emerald-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 7. Category Room */}
        <Link href="/admin/categoryroom" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-pink-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📁</div>
            <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition">Category Room</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-pink-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 8. Admin Users */}
        <Link href="/admin/admin-users" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-yellow-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🛡️</div>
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">Admin Users</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-yellow-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 9. Gift & Award Management */}
        <Link href="/admin/my-gift" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🎁</div>
            <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">Gift & Award Management</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-orange-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 10. Special Offer Management */}
        <Link href="/admin/special-offer-manage" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-rose-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🔥</div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition">Special Offer Management</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-rose-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 11. Return Approval */}
        <Link href="/admin/return-approval" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🔄</div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">Return Approval</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-amber-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 12. Coupon Management */}
        <Link href="/admin/manage-coupon" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-teal-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🎟️</div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">Coupon Management</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-teal-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

        {/* 13. Question & Answer */}
        <Link href="/admin/question-anser" className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-pointer no-underline text-white">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">❓</div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">Question & Answer</h3>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-cyan-400 gap-1 group-hover:translate-x-1 transition">
            <span>প্রবেশ করুন</span> ➔
          </div>
        </Link>

      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto text-center mt-12 text-slate-500 text-xs">
        <p>© 2026 AYAAT SPORT SHOP — Admin Control Room System.</p>
      </div>

    </div>
  );
}
