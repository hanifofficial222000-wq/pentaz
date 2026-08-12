'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// গ্লোবাল ব্যানার কম্পোনেন্ট
export function GlobalBanner({ type = 'top', message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    top: 'bg-[#e63946] text-white py-2 px-4 text-xs font-medium text-center',
    bottom: 'bg-[#333] text-white py-3 px-4 text-xs rounded-xl shadow-md my-4 text-center mx-auto',
  };

  return (
    <div className={`flex justify-between items-center max-w-[500px] mx-auto ${styles[type] || styles.top}`}>
      <span className="flex-1">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }} 
        className="bg-transparent border-none text-inherit font-bold cursor-pointer text-sm ml-2 p-1"
      >
        ✕
      </button>
    </div>
  );
}

export default function PaymentMethodsPage({ 
  globalTopBanner = '💳 নিরাপদ ও সহজ লেনদেনের জন্য আমাদের অফিসিয়াল পেমেন্ট মেথডগুলো দেখে নিন!', 
  globalBottomBanner = '📢 পেমেন্ট সংক্রান্ত যেকোনো সহায়তায় আয়াাত শপের কাস্টমার কেয়ারে যোগাযোগ করুন।' 
}) {
  const [showTopPopup, setShowTopPopup] = useState(true);

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-[15px] font-sans text-[#333]">
      
      {/* গ্লোবাল টপ ব্যানার স্লট */}
      {showTopPopup && (
        <div className="mb-3">
          <GlobalBanner 
            type="top" 
            message={globalTopBanner} 
            onClose={() => setShowTopPopup(false)} 
          />
        </div>
      )}

      <div className="max-w-[500px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center bg-white p-[15px] rounded-[12px] mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <Link 
            href="/" 
            className="no-underline text-[#333] text-[14px] font-bold bg-[#f1f3f5] px-3 py-1.5 rounded-[8px] mr-[15px]"
          >
            ← ব্যাক
          </Link>
          <h2 className="text-[16px] text-[#333] font-bold m-0">পেমেন্ট মেথড (Payment Methods)</h2>
        </div>

        {/* bKash */}
        <a href="tel:*247#" className="bg-white p-[15px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[12px] flex justify-between items-center no-underline border border-[#eaeaea] transition duration-200 hover:border-[#e63946] hover:bg-[#fff9f9]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[42px] h-[42px] rounded-full bg-[#e2136e] flex items-center justify-center text-[18px] font-bold text-white shrink-0">
              ৳
            </div>
            <div>
              <h4 className="text-[14px] text-[#333] mb-[3px] font-bold">বিকাশ (bKash Personal)</h4>
              <p className="text-[13px] text-[#666] font-medium m-0">01835302525</p>
            </div>
          </div>
          <span className="text-[12px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#d4edda] text-[#155724]">
            Active
          </span>
        </a>

        {/* Nagad */}
        <a href="tel:*167#" className="bg-white p-[15px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[12px] flex justify-between items-center no-underline border border-[#eaeaea] transition duration-200 hover:border-[#e63946] hover:bg-[#fff9f9]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[42px] h-[42px] rounded-full bg-[#f7931e] flex items-center justify-center text-[18px] font-bold text-white shrink-0">
              ন
            </div>
            <div>
              <h4 className="text-[14px] text-[#333] mb-[3px] font-bold">নগদ (Nagad Personal)</h4>
              <p className="text-[13px] text-[#666] font-medium m-0">01835302525</p>
            </div>
          </div>
          <span className="text-[12px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#d4edda] text-[#155724]">
            Active
          </span>
        </a>

        {/* Rocket */}
        <a href="tel:*322#" className="bg-white p-[15px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[12px] flex justify-between items-center no-underline border border-[#eaeaea] transition duration-200 hover:border-[#e63946] hover:bg-[#fff9f9]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[42px] h-[42px] rounded-full bg-[#8c3493] flex items-center justify-center text-[18px] font-bold text-white shrink-0">
              র
            </div>
            <div>
              <h4 className="text-[14px] text-[#333] mb-[3px] font-bold">রকেট (Rocket Personal)</h4>
              <p className="text-[13px] text-[#666] font-medium m-0">01835302525</p>
            </div>
          </div>
          <span className="text-[12px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#d4edda] text-[#155724]">
            Active
          </span>
        </a>

        {/* Cash on Delivery */}
        <div className="bg-white p-[15px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[12px] flex justify-between items-center border border-[#eaeaea]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[42px] h-[42px] rounded-full bg-[#2b2b2b] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
              COD
            </div>
            <div>
              <h4 className="text-[14px] text-[#333] mb-[3px] font-bold">Cash on Delivery</h4>
              <p className="text-[13px] text-[#666] font-medium m-0">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
            </div>
          </div>
          <span className="text-[12px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#e2e3e5] text-[#383d41]">
            Default
          </span>
        </div>

      </div>

      {/* গ্লোবাল বটম ব্যানার স্লট */}
      <GlobalBanner type="bottom" message={globalBottomBanner} />

    </div>
  );
}
