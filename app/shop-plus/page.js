'use client';

import React from 'react';
import Link from 'next/link';

export default function ShopPlusPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-['Arial',sans-serif]">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">
        
        {/* Card Container */}
        <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] text-center">
          
          {/* Sub Page Header */}
          <div className="flex items-center justify-between mb-[25px] border-b border-[#eee] pb-[12px] text-left">
            <h3 className="text-[18px] text-[#e63946] font-bold">Shop Plus</h3>
            <Link 
              href="/" 
              className="bg-[#f1f3f5] border-none py-[8px] px-[14px] rounded-[8px] font-weight-bold cursor-pointer text-[13px] no-underline text-[#333] font-bold transition hover:bg-[#e2e6ea]"
            >
              Back
            </Link>
          </div>
          
          {/* Plus Logo & Title */}
          <div className="text-[50px] mb-[10px]">⭐</div>
          <div className="text-[22px] font-bold text-[#222] mb-[8px] bg-gradient-to-r from-[#e63946] to-[#ffb703] bg-clip-text text-transparent">
            AYAAT SPORTS SHOP PLUS
          </div>
          <div className="text-[14px] text-[#666] mb-[25px] leading-[1.6]">
            আমাদের প্রিমিয়াম মেম্বারশিপ প্রোগ্রাম। খুব শীঘ্রই আপনাদের জন্য এটি চালু হতে যাচ্ছে। যুক্ত হয়ে উপভোগ করুন এক্সক্লুসিভ সব সুবিধা!
          </div>

          {/* Benefits Box */}
          <div className="bg-[#fff9db] border border-dashed border-[#ffb703] rounded-[12px] p-[20px] text-left mb-[25px]">
            <h4 className="text-[#d4a373] mb-[12px] text-[16px] font-bold flex items-center gap-[8px]">
              🎁 মেম্বারশিপের সুবিধাসমূহ:
            </h4>
            <ul className="list-none">
              <li className="text-[14px] text-[#444] mb-[10px] flex items-center gap-[8px]">
                ✨ প্রতিটি কেনাকাটায় স্পেশাল ডিসকাউন্ট ও ক্যাশব্যাক।
              </li>
              <li className="text-[14px] text-[#444] mb-[10px] flex items-center gap-[8px]">
                🚚 ফ্রি ডেলিভারি সুবিধা (শর্ত প্রযোজ্য)।
              </li>
              <li className="text-[14px] text-[#444] mb-[10px] flex items-center gap-[8px]">
                ⚡ নতুন পণ্যের নোটিফিকেশন সবার আগে পাওয়া।
              </li>
              <li className="text-[14px] text-[#444] mb-[10px] flex items-center gap-[8px]">
                👑 প্রিমিয়াম ব্যাজ ও ভিআইপি কাস্টমার সাপোর্ট।
              </li>
            </ul>
          </div>

          {/* Coming Soon Badge */}
          <div className="bg-[#e63946] text-white p-[12px] rounded-[12px] font-bold text-[15px] tracking-[1px] shadow-[0_4px_10px_rgba(230,57,70,0.3)]">
            🚀 COMING SOON...
          </div>

        </div>
      </div>
    </div>
  );
}
