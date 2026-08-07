'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import "./globals.css";

// গ্লোবাল ট্রান্সলেশন অবজেক্ট
const globalTranslations = {
  bn: {
    shopName: "AYAAT SPORT SHOP",
    founder: "প্রতিষ্ঠাতা: Md Hanif Cox",
    address: "ঠিকানা: মাইজপাড়া, কালারমারছড়া, মহেশখালী",
    phone: "ফোন: +8801835302525",
    rights: "© ২০২৬ AYAAT SPORT SHOP. সর্বস্বত্ব সংরক্ষিত।"
  },
  en: {
    shopName: "AYAAT SPORT SHOP",
    founder: "Founder: Md Hanif Cox",
    address: "Address: Maizpara, Kalamarkhara, Maheshkhali",
    phone: "Phone: +8801835302525",
    rights: "© 2026 AYAAT SPORT SHOP. All rights reserved."
  },
  ar: {
    shopName: "متجر آيات الرياضي",
    founder: "المؤسس: محمد حنيف كوكس",
    address: "العنوان: مايزبارا، كالاماركهارا، ماهيشخالي",
    phone: "الهاتف: +8801835302525",
    rights: "© 2026 متجر آيات الرياضي. جميع الحقوق محفوظة."
  },
  ur: {
    shopName: "آیات سپورٹس شاپ",
    founder: "بانی: محمد حنیف کاکس",
    address: "پتہ: میزپارہ، کلارمارچھڑا، مہیشখালী",
    phone: "فون: +8801835302525",
    rights: "© 2026 آیات سپورٹس شاپ۔ جملہ حقوق محفوظ ہیں۔"
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
      <body className="bg-gray-100 flex justify-center font-sans">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl overflow-hidden flex flex-col justify-between">
          
          <div>
            {/* টপ ল্যাঙ্গুয়েজ বার */}
            <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between sticky top-0 z-50">
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
            <main>
              {children}
            </main>
          </div>

          {/* ফুটার এবং হোয়াটসঅ্যাপ বাটন */}
          <div>
            <a 
              href="https://wa.me/8801835302525" 
              className="fixed bottom-5 right-5 bg-[#25D366] text-white w-10 h-10 rounded-full flex items-center justify-center text-lg no-underline shadow-lg z-50 hover:scale-105 transition" 
              target="_blank" 
              rel="noreferrer"
            >
              💬
            </a>

            <footer className="bg-[#2b2b2b] text-[#e5e5e5] p-5 text-center rounded-t-xl mt-8">
              <h3 className="text-[#ff4d4d] mb-2 text-sm font-bold">{t.shopName}</h3>
              <p className="text-[11px] leading-relaxed my-0.5 text-[#cccccc]"><b>{t.founder}</b></p>
              <p className="text-[11px] leading-relaxed my-0.5 text-[#cccccc]"><b>{t.address}</b></p>
              <p className="text-[11px] leading-relaxed my-0.5 text-[#cccccc]"><b>{t.phone}</b></p>
              <p className="mt-3 text-[10px] text-[#aaa]">{t.rights}</p>
            </footer>
          </div>

        </div>
      </body>
    </html>
  );
}
