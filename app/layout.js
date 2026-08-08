'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import "./globals.css";

// গ্লোবাল ট্রান্সলেশন অবজেক্ট
const globalTranslations = {
  bn: {
    shopName: "AYAAT SHOP LTD"
  },
  en: {
    shopName: "AYAAT SHOP LTD"
  },
  ar: {
    shopName: "متجر آيات المحدودة"
  },
  ur: {
    shopName: "آیات شاپ لمیٹڈ"
  }
};

export default function RootLayout({ children }) {
  const [currentLang, setLang] = useState('bn');
  const [direction, setDirection] = useState('ltr');

  // বটম নেভবার স্ক্রল হাইড/শো করার স্টেট ও রেফারেন্স
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

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

  // বটম নেভবারের জন্য স্ক্রল ডিটেকশন লজিক
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // যদি স্ক্রল করে নিচে নামানো হয় (currentScrollY > lastScrollY), তবে নেভবার হাইড হবে
      // আর যদি ওপরের দিকে স্ক্রল করা হয়, তবে নেভবার শো হবে
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

          {/* হোয়াটসঅ্যাপ ফ্লোটিং বাটন (নেভবারের সাথে পজিশন সিংক্রোনাইজ করার জন্য ডাইনামিক ক্লাস দেওয়া হয়েছে) */}
          <a 
            href="https://wa.me/8801835302525" 
            className={`fixed right-5 bg-[#25D366] text-white w-11 h-11 rounded-full flex items-center justify-center text-xl no-underline shadow-lg z-50 hover:scale-105 transition-all duration-300 ${showNavbar ? 'bottom-20' : 'bottom-5'}`} 
            target="_blank" 
            rel="noreferrer"
          >
            💬
          </a>

          {/* গ্লোবাল বটম নেভবার (스크ল অনুযায়ী হাইড ও শো হওয়ার অ্যানিমেশন যুক্ত করা হয়েছে) */}
          <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-3 z-40 shadow-lg transition-transform duration-300 ${showNavbar ? 'translate-y-0' : 'translate-y-full'}`}>
            <Link href="/" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              🏠
            </Link>
            <Link href="/category" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              📂
            </Link>
            <Link href="/my-gifts" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              🎁
            </Link>
            <Link href="/favorites" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              ❤️
            </Link>
            <Link href="/cart" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              🛒
            </Link>
            <Link href="/register" className="flex items-center justify-center text-xl text-gray-600 hover:text-[#e63946] no-underline transition-transform hover:scale-110">
              👤
            </Link>
          </nav>

        </div>
      </body>
    </html>
  );
}
