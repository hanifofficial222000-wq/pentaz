'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('bn');
  const [direction, setDirection] = useState('ltr');

  // মাল্টি-ল্যাঙ্গুয়েজ ডিকশনারি
  const translations = {
    bn: {
      backBtn: "← ব্যাক",
      settingsTitle: "Settings (সেটিংস)",
      accountControlTitle: "অ্যাকাউন্ট কন্ট্রোল",
      accountControlDesc: "আপনার অ্যাকাউন্ট থেকে নিরাপদে লগআউট করতে নিচের বাটনে ক্লিক করুন।",
      logoutBtn: "🚪 লগআউট করুন (Log Out)",
      logoutConfirm: "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?",
      logoutSuccess: "সফলভাবে লগআউট করা হয়েছে!"
    },
    en: {
      backBtn: "← Back",
      settingsTitle: "Settings",
      accountControlTitle: "Account Control",
      accountControlDesc: "Click the button below to safely log out from your account.",
      logoutBtn: "🚪 Log Out",
      logoutConfirm: "Are you sure you want to log out?",
      logoutSuccess: "Successfully logged out!"
    },
    ar: {
      backBtn: "← رجوع",
      settingsTitle: "الإعدادات",
      accountControlTitle: "تحكم الحساب",
      accountControlDesc: "انقر على الزر أدناه لتسجيل الخروج بأمان من حسابك.",
      logoutBtn: "🚪 تسجيل الخروج",
      logoutConfirm: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      logoutSuccess: "تم تسجيل الخروج بنجاح!"
    },
    ur: {
      backBtn: "← واپس",
      settingsTitle: "ترتیبات",
      accountControlTitle: "اکاؤنٹ کنٹرول",
      accountControlDesc: "اپنے اکاؤنٹ سے محفوظ طریقے سے لاگ آؤٹ کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔",
      logoutBtn: "🚪 لاگ آؤٹ",
      logoutConfirm: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
      logoutSuccess: "کامیابی کے ساتھ لاگ آؤٹ ہو گیا!"
    }
  };

  // পেজ লোড হলে সংরক্ষিত ভাষা লোড করা
  useEffect(() => {
    const savedLang = localStorage.getItem('selected_language') || 'bn';
    setCurrentLang(savedLang);
    if (savedLang === 'ar' || savedLang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  }, []);

  // ভাষা পরিবর্তন হ্যান্ডলার
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    localStorage.setItem('selected_language', lang);

    if (lang === 'ar' || lang === 'ur') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  };

  // লগআউট হ্যান্ডলার
  const handleLogout = () => {
    const t = translations[currentLang] || translations['bn'];

    if (window.confirm(t.logoutConfirm)) {
      localStorage.removeItem('ayaat_user');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('phone');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhoto');

      alert(t.logoutSuccess);
      router.push('/');
    }
  };

  const t = translations[currentLang] || translations['bn'];

  return (
    <div dir={direction} className="bg-[#f4f6f9] min-h-screen p-[15px] text-[#333] font-['Segoe_UI',sans-serif]">
      <div className="max-w-[500px] mx-auto">
        
        {/* LANGUAGE SELECTOR BAR */}
        <div className="flex justify-end mb-2.5">
          <select 
            value={currentLang} 
            onChange={handleLanguageChange} 
            className="p-[6px_10px] rounded-[8px] border border-[#ddd] text-[13px] bg-white outline-none cursor-pointer font-bold text-[#e63946]"
          >
            <option value="bn">🇧🇩 বাংলা</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="ur">🇵🇰 اردو</option>
          </select>
        </div>

        {/* Header */}
        <div className="flex items-center bg-white p-[15px] rounded-[12px] mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <Link href="/" className="no-underline text-[#333] text-[14px] font-bold bg-[#f1f3f5] p-[6px_12px] rounded-[8px] mr-[15px] hover:bg-[#e2e6ea]">
            {t.backBtn}
          </Link>
          <h2 className="text-[16px] text-[#333] font-bold">{t.settingsTitle}</h2>
        </div>

        {/* Logout Section Card */}
        <div className="bg-white p-5 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-3 border border-[#eaeaea]">
          <h3 className="text-[15px] text-[#333] mb-2 font-bold">{t.accountControlTitle}</h3>
          <p className="text-[13px] text-[#666] mb-[15px]">{t.accountControlDesc}</p>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="bg-[#e63946] hover:bg-[#c52a36] text-white p-[14px] rounded-[10px] text-[14px] font-bold cursor-pointer text-center border-none w-full transition"
          >
            {t.logoutBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
