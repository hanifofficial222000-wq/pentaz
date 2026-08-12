'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
  // লোকাল পপআপ বা ক্লোজেবল ব্যানার স্টেট
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-10 text-[#333] font-sans relative">
      
      {/* টপ অ্যানাউন্সমেন্ট ব্যানার */}
      {showPopup && (
        <div className="bg-[#e63946] text-white text-center py-2 px-4 text-xs font-medium flex justify-between items-center max-w-[500px] mx-auto">
          <span>🎉 বিশেষ ঘোষণা: আয়াাত শপ লিমিটেড-এর গ্র্যান্ড ওপেনিং উপলক্ষে চলছে বিশেষ ছাড়!</span>
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
              <p className="mb-2"><b className="text-black">Owners:</b> AYAAT SHOP LTD</p>
              <p className="mb-2"><b className="text-black">Location:</b> Bangladesh</p>
              <p className="mb-0"><b className="text-black">Opening:</b> 20-08-2026</p>
            </div>

          </div>

        </div>

        {/* বটম ইনফো বক্স */}
        <div className="mt-5 bg-[#333] text-white p-3 rounded-xl text-center text-xs shadow-md">
          <p className="m-0">📢 যেকোনো প্রয়োজনে আমাদের হটলাইন নম্বরে যোগাযোগ করুন অথবা হোয়াটসঅ্যাপে চ্যাট করুন।</p>
        </div>

      </div>

    </div>
  );
}
