'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; 
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

  // অ্যাডমিন প্যানেলের অপশনগুলোর লিস্ট ও লিংক (নতুন ৭টিসহ মোট ২০টি মেনু)
  const adminMenus = [
    { name: 'Customize', icon: '⚙️', route: '/admin/product-costumize' },
    { name: 'Approval', icon: '⏳', route: '/admin/product-approval' },
    { name: 'Banner', icon: '🖼️', route: '/admin/banner' },
    { name: 'Support', icon: '💬', route: '/admin/costumer-spurt' },
    { name: 'Orders', icon: '📦', route: '/admin/order' },
    { name: 'Offers', icon: '🏷️', route: '/admin/product-offer' },
    { name: 'Category', icon: '📁', route: '/admin/categoryroom' },
    { name: 'Admins', icon: '🛡️', route: '/admin/admin-users' },
    { name: 'Gifts', icon: '🎁', route: '/admin/my-gift' },
    { name: 'Global CP', icon: '💻', route: '/admin/GlobalControlPanel' },
    { name: 'Returns', icon: '🔄', route: '/admin/return-approval' },
    { name: 'Coupons', icon: '🎟️', route: '/admin/manage-coupon' },
    { name: 'Q & A', icon: '❓', route: '/admin/question-answer' },
    { name: 'Home Editor', icon: '🏠', route: '/admin/home-editor' },
    { name: 'sellers', icon: '📁', route: '/admin/sellers' },
    { name: 'Page 2', icon: '📄', route: '/admin/page-2' },
    { name: 'Page 3', icon: '📄', route: '/admin/page-3' },
    { name: 'Page 4', icon: '📄', route: '/admin/page-4' },
    { name: 'Page 5', icon: '📄', route: '/admin/page-5' },
    { name: 'Page 6', icon: '📄', route: '/admin/page-6' }
  ];

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

      {/* Navigation Grid System: এক লাইনে ৪টি করে গোল বাটন ও আইকন */}
      <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 md:p-8 shadow-2xl backdrop-blur-sm">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Admin Quick Navigation</h2>
        
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          {adminMenus.map((menu, index) => (
            <Link 
              key={index} 
              href={menu.route} 
              className="flex flex-col items-center group no-underline cursor-pointer"
            >
              {/* গোল বাটন ও আইকন */}
              <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-slate-800 border border-slate-700 group-hover:border-red-500 group-hover:bg-slate-750 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition duration-300 transform group-hover:-translate-y-1">
                {menu.icon}
              </div>
              {/* বাটনের নিচের ছোট নাম */}
              <span className="text-[11px] sm:text-xs text-slate-300 text-center mt-2 font-medium group-hover:text-red-400 leading-tight transition">
                {menu.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto text-center mt-12 text-slate-500 text-xs">
        <p>© 2026 AYAAT SPORT SHOP — Admin Control Room System.</p>
      </div>

    </div>
  );
}
