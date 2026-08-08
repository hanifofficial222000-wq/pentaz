'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen p-5 font-sans text-[#333]">
      <div className="max-w-[800px] bg-white p-[30px] mx-auto rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        
        <h1 className="text-[#e53e3e] text-[24px] font-bold mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-[#555] mb-4">Last updated: August 2026</p>

        <p className="text-[14px] text-[#555] mb-4">
          At <strong>AYAAT SHOP LTD</strong>, accessible from our platform, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by AYAAT SHOP LTD and how we use it.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-5 mb-2">1. Information We Collect</h2>
        <p className="text-[14px] text-[#555] mb-4">
          We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise contact us.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-5 mb-2">2. How We Use Your Information</h2>
        <p className="text-[14px] text-[#555] mb-2">We use the information we collect in various ways, including to:</p>
        <ul className="list-disc pl-5 text-[14px] text-[#555] space-y-1 mb-4">
          <li>Provide, operate, and maintain our website and app.</li>
          <li>Improve, personalize, and expand our services.</li>
          <li>Understand and analyze how you use our platform.</li>
          <li>Process your transactions and manage your orders.</li>
        </ul>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-5 mb-2">3. Data Security</h2>
        <p className="text-[14px] text-[#555] mb-4">
          We use commercially acceptable means to protect your personal information, but remember that no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-5 mb-2">4. Contact Us</h2>
        <p className="text-[14px] text-[#555] mb-2">If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us through the email below:</p>
        
        <div className="bg-[#f1f5f9] p-[12px_15px] rounded-[5px] mt-[10px]">
          <p className="text-[14px] text-[#555] m-0"><strong>Email:</strong> ayaatshop@gmail.com</p>
        </div>

        <Link 
          href="/" 
          className="inline-block mt-5 px-[15px] py-[8px] bg-[#e53e3e] text-white no-underline rounded-[4px] font-bold text-xs hover:bg-[#d9363e] transition"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}

