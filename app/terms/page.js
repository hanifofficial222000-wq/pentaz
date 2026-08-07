'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen p-[20px] text-[#333] font-['Arial',sans-serif]">
      <div className="max-w-[800px] bg-white p-[30px] mx-auto rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
        
        <h1 className="text-[#e53e3e] text-[24px] font-bold mb-1">Terms and Conditions</h1>
        <p className="text-[14px] text-[#555] mb-5">Last updated: August 2026</p>

        <p className="text-[14px] text-[#555] leading-[1.6] mb-4">
          Welcome to <strong>AYAAT SHOP LTD</strong>! These terms and conditions outline the rules and regulations for the use of our website and mobile application.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-[20px] mb-2">1. Acceptance of Terms</h2>
        <p className="text-[14px] text-[#555] leading-[1.6] mb-4">
          By accessing this website and app, we assume you accept these terms and conditions. Do not continue to use AYAAT SHOP LTD if you do not agree to all of the terms stated on this page.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-[20px] mb-2">2. User Accounts</h2>
        <p className="text-[14px] text-[#555] leading-[1.6] mb-4">
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-[20px] mb-2">3. Products and Pricing</h2>
        <p className="text-[14px] text-[#555] leading-[1.6] mb-4">
          All products are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.
        </p>

        <h2 className="text-[18px] text-[#2d3748] font-bold mt-[20px] mb-2">4. Limitation of Liability</h2>
        <p className="text-[14px] text-[#555] leading-[1.6] mb-4">
          In no event shall AYAAT SHOP LTD, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.
        </p>

        <Link 
          href="/" 
          className="inline-block mt-[20px] px-[15px] py-[8px] bg-[#e53e3e] hover:bg-[#c52a36] text-white no-underline rounded-[4px] font-bold text-[14px] transition"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}
