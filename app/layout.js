'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import "./globals.css";

// গ্লোবাল ট্রান্সলেশন অবজেক্ট
const globalTranslations = {
  bn: {
    shopName: "AYAAT SPORT SHOP"
  },
  en: {
    shopName: "AYAAT SPORT SHOP"
  },
  ar: {
    shopName: "متجر آيات الرياضي"
  },
  ur: {
    shopName: "آیات سپورٹس شاپ"
  }
};

export default function RootLayout({ children }) {
  const [currentLang, setLang] = useState('bn');
  const [direction, setDirection] = useState('ltr');

  // পেজ লোড হলে লোকালস্টোরেজ থেকে ভাষা সেট করা
  useEffect(() => {
    const savedLang = localStorage.getItem('selected_language') || 'bn';
    setLang(savedLang);
    if (savedLang === 'ar' || savedLang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  }, []);

  // ভাষা পরিবর্তনের ফাংশন
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLang(lang);
    localStorage.setItem('selected_language', lang);
    if (lang === 'ar' || lang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
    window.location.reload(); // পেজ রিলোড হয়ে ভাষা আপডেট করবে
  };

  const t = globalTranslations[currentLang] || globalTranslations['bn'];

  return (
    <html lang={currentLang} dir={direction}>
      <body className="bg-gray-100 flex justify-center font-sans pb-20">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl overflow-hidden flex flex-col justify-between relative">
          
          <div className="flex-grow">
            {/* টপ ল্যাঙ্গুয়েজ বার */}
            <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
              <Link href="/" className="font-extrabold text-[#e63946] text-xs no-underline">
                {t.shopName}
              </Link>
              <select 
                value={currentLang} 
                onChange={handleLanguageChange} 
                className="p-1 rounded-md border border-gray-300 text-[11px] font-bold bg-white text-[#e63946] cursor-pointer outline-none"
              >
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="ur">🇵🇰 اردو</option>
              </select>
            </div>

            {/* মূল পেজের কনটেন্ট */}
            <main className="pb-16">
              {children}
            </main>
          </div>

          {/* হোয়াটসঅ্যাপ ফ্লোটিং বাটন */}
          <a 
            href="https://wa.me/8801835302525" 
            className="fixed bottom-16 right-5 bg-[#25D366] text-white w-11 h-11 rounded-full flex items-center justify-center text-xl no-underline shadow-lg z-50 hover:scale-105 transition" 
            target="_blank" 
            rel="noreferrer"
          >
            💬
          </a>

          {/* গ্লোবাল বটম নেভবার (সব পেজে শো করবে) */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-2.5 z-40 shadow-lg">
            <Link href="/" className="flex flex-col items-center text-gray-500 text-[10px] font-bold hover:text-[#e63946] no-underline">
              🏠 Home
            </Link>
            <Link href="/category" className="flex flex-col items-center text-gray-500 text-[10px] font-bold hover:text-[#e63946] no-underline">
              📂 Categories
            </Link>
            <Link href="/my-gifts" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946] no-underline">
              🎁 Gift
            </Link>
            <Link href="/favorites" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946] no-underline">
              ❤️ Favorites
            </Link>
            <Link href="/cart" className="flex flex-col items-center text-gray-500 text-[10px] font-bold relative hover:text-[#e63946] no-underline">
              🛒 Cart
            </Link>
            <Link href="/register" className="flex flex-col items-center text-gray-500 text-[10px] font-bold hover:text-[#e63946] no-underline">
              👤 Account
            </Link>
          </nav>

        </div>
      </body>
    </html>
  );
}
