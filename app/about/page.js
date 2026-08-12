'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AboutUsPage({ bannerText, topBanner, bottomBanner }) {
  // লোকাল পপআপ বা ক্লোজেবল ব্যানার স্টেট
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[90px] text-[#333] font-sans relative">
      
      {/* গ্লোবাল টপ পপআপ / অ্যানাউন্সমেন্ট ব্যানার */}
      {(topBanner || showPopup) && (
        <div className="bg-[#e63946] text-white text-center py-2 px-4 text-xs font-medium flex justify-between items-center max-w-[500px] mx-auto">
          <span>{topBanner || '🎉 বিশেষ ঘোষণা: আয়াাত শপ লিমিটেড-এর গ্র্যান্ড ওপেনিং উপলক্ষে চলছে বিশেষ ছাড়!'}</span>
          <button 
            onClick={() => setShowPopup(false)} 
            className="bg-transparent border-none text-white font-bold cursor-pointer text-sm ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-[500px] mx-auto pt-4 px-4">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-5 border-b border-[#eee] pb-3">
            <h3 className="text-[18px] text-[#e63946] font-bold">AYAAT SHOP</h3>
            <Link 
              href="/" 
              className="bg-[#f1f3f5] hover:bg-[#e2e6ea] border-none py-2 px-3.5 rounded-lg font-bold text-[13px] no-underline text-[#333] transition"
            >
              Back
            </Link>
          </div>
          
          {/* Content */}
          <div className="text-[14px] text-[#555] leading-relaxed">
            <p className="mb-3">
              <b className="text-black">AYAAT SHOP</b> হলো একটি বিশ্বস্ত অনলাইন কেনাবেচার নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা সাশ্রয়ী মূল্যে মানসম্মত বিভিন্ন ধরনের পণ্য গ্রাহকদের কাছে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
            </p>
            
            <p className="mb-3">
              আমাদের লক্ষ্য হলো ঘরে বসে সহজেই যেন ক্রেতারা তাদের পছন্দের যেকোনো পণ্য বা সামগ্রী সংগ্রহ করতে পারেন এবং নিজেরাও পণ্য বিক্রি করার সুযোগ পান।
            </p>

            {/* Highlight Box */}
            <div className="bg-[#fff5f5] border border-dashed border-[#e63946] rounded-xl p-4 mt-5 text-left">
              <h4 className="text-[#e63946] mb-2 text-[15px] font-bold">AYAAT SHOP</h4>
              <p className="mb-2"><b className="text-black">owners:</b> AYAAT SHOP LTD</p>
              <p className="mb-2"><b className="text-black">location:</b> BANGLADESH</p>
              <p className="mb-0"><b className="text-black">opening:</b> 20-08-2026</p>
            </div>

            {/* Partners Section */}
            <div className="mt-6 pt-4 border-t border-[#eee]">
              <h3 className="text-[16px] font-bold text-[#222] mb-3 text-center">PARTNERSHIP MEMBERS</h3>
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* পার্টনার ১ */}
                <div 
                  onClick={() => window.location.href='/brand-store?brand=styli'} 
                  className="bg-white border border-[#eaeaea] rounded-xl p-4 text-center cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:border-[#e63946] transition"
                >
                  <img 
                    src="/images/partner1.jpg" 
                    alt="Partner 1" 
                    className="w-[55px] h-[55px] object-contain rounded-full mx-auto mb-2 block bg-[#f8f9fa] border border-[#eee] p-0.5" 
                  />
                  <h4 className="text-[13px] font-bold text-[#333] mb-1">Md Abu Hanifa</h4>
                  <p className="text-[11px] text-[#555] mb-1">📞 +8801835302525</p>
                  <p className="text-[11px] text-[#e63946] font-bold mb-1">🏢 Branch Cox&apos;s bazar</p>
                  <p className="text-[10px] text-[#666] m-0">📍 Partnerships</p>
                </div>

                {/* পার্টনার ২ */}
                <div 
                  onClick={() => window.location.href='/brand-store?brand=styli'} 
                  className="bg-white border border-[#eaeaea] rounded-xl p-4 text-center cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:border-[#e63946] transition"
                >
                  <img 
                    src="/images/partner2.jpg" 
                    alt="Partner 2" 
                    className="w-[55px] h-[55px] object-contain rounded-full mx-auto mb-2 block bg-[#f8f9fa] border border-[#eee] p-0.5" 
                  />
                  <h4 className="text-[13px] font-bold text-[#333] mb-1">Mohammad Islam</h4>
                  <p className="text-[11px] text-[#555] mb-1">📞 +8801860070018</p>
                  <p className="text-[11px] text-[#e63946] font-bold mb-1">🏢 Branch Comilla</p>
                  <p className="text-[10px] text-[#666] m-0">📍 Partnerships</p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* গ্লোবাল বটম বিজ্ঞাপন বা ব্যানার স্লট */}
        <div className="mt-5 bg-[#333] text-white p-3 rounded-xl text-center text-xs shadow-md">
          <p className="m-0">{bottomBanner || '📢 যেকোনো প্রয়োজনে আমাদের হটলাইন নম্বরে যোগাযোগ করুন অথবা হোয়াটসঅ্যাপে চ্যাট করুন।'}</p>
        </div>

      </div>

      {/* WhatsApp Float Button */}
      <a 
        href="https://wa.me/8801835302525" 
        className="fixed bottom-20 right-5 bg-[#25D366] text-white w-[45px] h-[45px] rounded-full flex items-center justify-center text-[22px] no-underline shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[1000] hover:scale-105 transition" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        💬
      </a>

      {/* Global Bottom Navigation Bar Support */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-50 shadow-lg">
        <button onClick={() => window.location.href='/'} className="flex flex-col items-center text-xs font-bold text-gray-600 hover:text-[#e63946] bg-transparent border-none cursor-pointer">
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </button>
        <button onClick={() => window.location.href='/cart'} className="flex flex-col items-center text-xs font-bold text-gray-600 hover:text-[#e63946] bg-transparent border-none cursor-pointer">
          <span className="text-lg">🛒</span>
          <span>Cart</span>
        </button>
        <button onClick={() => window.location.href='/orders'} className="flex flex-col items-center text-xs font-bold text-gray-600 hover:text-[#e63946] bg-transparent border-none cursor-pointer">
          <span className="text-lg">📦</span>
          <span>Orders</span>
        </button>
        <button onClick={() => window.location.href='/profile'} className="flex flex-col items-center text-xs font-bold text-gray-600 hover:text-[#e63946] bg-transparent border-none cursor-pointer">
          <span className="text-lg">👤</span>
          <span>Profile</span>
        </button>
      </div>

    </div>
  );
}
