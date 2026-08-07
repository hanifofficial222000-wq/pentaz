'use client';

import React from 'react';
import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      
      <div className="max-w-[500px] mx-auto my-[15px] px-[15px]">
        <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-5 border-b border-[#eee] pb-3">
            <h3 className="text-[18px] text-[#e63946] font-bold">Help Center</h3>
            <Link 
              href="/" 
              className="bg-[#f1f3f5] border-none px-[14px] py-2 rounded-[8px] font-bold cursor-pointer text-[13px] no-underline text-[#333] transition duration-200 hover:bg-[#e2e6ea]"
            >
              Back
            </Link>
          </div>
          
          {/* Hero Section */}
          <div className="text-center mb-5">
            <h2 className="text-[20px] text-[#222] mb-1.5 font-bold">আপনার কীভাবে সাহায্য প্রয়োজন?</h2>
            <p className="text-[13px] text-[#666]">নিচে সাধারণ কিছু প্রশ্ন ও উত্তর দেওয়া হলো। সমাধান না পেলে সরাসরি যোগাযোগ করুন।</p>
          </div>

          {/* FAQ Section */}
          <div className="mt-[15px]">
            <div className="text-[15px] text-[#e63946] mb-3 font-bold border-l-[3px] border-[#e63946] pl-2">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </div>

            <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-[10px] mb-2.5 p-[12px_15px]">
              <div className="text-[13.5px] font-bold text-[#333] mb-1">১. কীভাবে অর্ডার করব?</div>
              <div className="text-[13px] text-[#555] leading-[1.6]">আপনার পছন্দের পণ্যটি বেছে নিয়ে অর্ডার বাটনে ক্লিক করুন এবং আপনার সঠিক নাম, ফোন নম্বর ও ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।</div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-[10px] mb-2.5 p-[12px_15px]">
              <div className="text-[13.5px] font-bold text-[#333] mb-1">২. ডেলিভারি পেতে কতদিন সময় লাগে?</div>
              <div className="text-[13px] text-[#555] leading-[1.6]">সাধারণত আপনার লোকেশন অনুযায়ী অর্ডার কনফার্ম করার পর ২ থেকে ৫ কার্যদিবসের মধ্যে পণ্য পৌঁছে দেওয়া হয়।</div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-[10px] mb-2.5 p-[12px_15px]">
              <div className="text-[13.5px] font-bold text-[#333] mb-1">৩. পেমেন্ট পদ্ধতি কী?</div>
              <div className="text-[13px] text-[#555] leading-[1.6]">বর্তমানে আমাদের শপে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা চালু রয়েছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।</div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-[10px] mb-2.5 p-[12px_15px]">
              <div className="text-[13.5px] font-bold text-[#333] mb-1">৪. পণ্য পরিবর্তন বা রিটার্ন করা যাবে কি?</div>
              <div className="text-[13px] text-[#555] leading-[1.6]">পণ্যে কোনো ত্রুটি বা সমস্যা থাকলে ডেলিভারি পাওয়ার পর ২৪ ঘণ্টার মধ্যে আমাদের সাথে যোগাযোগ করে রিটার্ন বা পরিবর্তন করতে পারবেন।</div>
            </div>
          </div>

          {/* Support Box */}
          <div className="bg-[#e8f5e9] border border-dashed border-[#4caf50] rounded-[12px] p-[15px] text-center mt-[25px]">
            <h4 className="text-[#2e7d32] text-[15px] mb-2 font-bold">💬 আরও কোনো প্রশ্ন আছে?</h4>
            <p className="text-[13px] text-[#444] mb-3">আমাদের সাপোর্ট টিম সবসময় আপনার সহায়তায় প্রস্তুত। সরাসরি হোয়াটসঅ্যাপে কথা বলুন।</p>
            <a 
              href="https://wa.me/8801835302525" 
              className="inline-block bg-[#25D366] text-white p-[10px_20px] rounded-[8px] no-underline font-bold text-[13px] shadow-[0_4px_10px_rgba(37,211,102,0.3)]" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              হোয়াটসঅ্যাপে চ্যাট করুন
            </a>
          </div>

        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/8801835302525" 
        className="fixed bottom-5 right-5 bg-[#25D366] text-white w-[45px] h-[45px] rounded-full flex items-center justify-center text-[22px] no-underline shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[1000]" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        💬
      </a>

      {/* Footer */}
      <footer className="bg-[#2b2b2b] text-[#e5e5e5] p-[25px_15px] mt-[40px] text-center rounded-t-[12px]">
        <h3 className="text-[#ff4d4d] mb-3 text-[18px] font-bold">AYAAT SPORT SHOP</h3>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>প্রতিষ্ঠাতা:</b> Md Hanif Cox</p>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>ঠিকানা:</b> মাইজপাড়া, কালারমারছড়া, মহেশখালী | বাংলাদেশ</p>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>ফোন:</b> +8801835302525</p>
        <p className="mt-[15px] text-[12px] text-[#aaa]">© ২০২৬ AYAAT SPORT SHOP. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>

    </div>
  );
}
