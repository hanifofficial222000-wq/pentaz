'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import "./globals.css";

const globalTranslations = {
  bn: { shopName: "AYAAT SHOP LTD", searchPlaceholder: "প্রোডাক্ট খুঁজুন..." },
  en: { shopName: "AYAAT SHOP LTD", searchPlaceholder: "Search products..." },
  ar: { shopName: "متجر آيات المحدودة", searchPlaceholder: "بحث عن منتجات..." },
  ur: { shopName: "آیات شاپ لمیٹڈ", searchPlaceholder: "مصنوعات تلاش کریں..." }
};

export default function RootLayout({ children }) {
  const [currentLang, setLang] = useState('bn');
  const [direction, setDirection] = useState('ltr');
  const [showNavbar, setShowNavbar] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const lastScrollY = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('selected_language') || 'bn';
    setLang(savedLang);
    if (savedLang === 'ar' || savedLang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLang(lang);
    localStorage.setItem('selected_language', lang);
    if (lang === 'ar' || lang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const t = globalTranslations[currentLang] || globalTranslations['bn'];

  return (
    <html lang={currentLang} dir={direction}>
      <body className="bg-gray-100 flex justify-center font-sans pb-20">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl overflow-hidden flex flex-col justify-between relative">
          
          <div className="flex-grow">
            {/* টপ ল্যাঙ্গুয়েজ বার ও সার্চ বক্স */}
            <div className="bg-white border-b border-gray-200 py-2 px-3 flex items-center justify-between gap-2 sticky top-0 z-50 shadow-sm">
              <Link href="/" className="font-extrabold text-[#e63946] text-xs no-underline flex-shrink-0">
                {t.shopName}
              </Link>

              {/* একদম উপরে মাঝখানের সাদা খালি অংশে সার্চ বক্স */}
              <form onSubmit={handleSearchSubmit} className="flex-grow max-w-[160px] relative">
                <input 
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-1 pl-3 pr-7 text-[10px] text-gray-800 outline-none focus:border-[#e63946] transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e63946] text-[10px] cursor-pointer">
                  🔍
                </button>
              </form>

              <select 
                value={currentLang} 
                onChange={handleLanguageChange} 
                className="p-1 rounded-md border border-gray-300 text-[11px] font-bold bg-white text-[#e63946] cursor-pointer outline-none flex-shrink-0"
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
            className={`fixed right-5 bg-[#25D366] text-white w-11 h-11 rounded-full flex items-center justify-center text-xl no-underline shadow-lg z-50 hover:scale-105 transition-all duration-300 ${showNavbar ? 'bottom-20' : 'bottom-5'}`} 
            target="_blank" 
            rel="noreferrer"
          >
            💬
          </a>

          {/* বটম নেভবার */}
          <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-2 px-1 z-40 shadow-lg transition-transform duration-300 ${showNavbar ? 'translate-y-0' : 'translate-y-full'}`}>
            
            <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-[#e63946] no-underline">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span className="text-[11px] font-medium mt-0.5">Home</span>
            </Link>

            <Link href="/category" className="flex flex-col items-center text-gray-500 hover:text-[#e63946] no-underline">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span className="text-[11px] font-medium mt-0.5">Categories</span>
            </Link>

            <Link href="/favorites" className="flex flex-col items-center text-gray-500 hover:text-[#e63946] no-underline">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span className="text-[11px] font-medium mt-0.5">Favorites</span>
            </Link>

            <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-[#e63946] no-underline">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span className="text-[11px] font-medium mt-0.5">Cart</span>
            </Link>

            <Link href="/my-details" className="flex flex-col items-center text-gray-500 hover:text-[#e63946] no-underline">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="text-[11px] font-medium mt-0.5">Account</span>
            </Link>

          </nav>

        </div>
      </body>
    </html>
  );
}
