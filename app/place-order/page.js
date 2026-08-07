'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PlaceOrderPage() {
  const router = useRouter();
  
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [custAddress, setCustAddress] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const name = custName.trim();
    const phone = custPhone.trim();
    const prodName = productName.trim();
    const price = Number(productPrice);
    const address = custAddress.trim();

    setSubmitting(true);
    setMessage({ text: '', color: '' });

    try {
      // ব্রাউজারের লোকালস্টোরেজে ফোন নম্বরটি সেভ করে রাখা হলো
      localStorage.setItem("userPhone", phone);

      // ফায়ারবেসে ডেটা পাঠানো
      await addDoc(collection(db, "orders"), {
        customerName: name,
        phone: phone,
        custPhone: phone, 
        productName: prodName,
        price: price,
        address: address,
        status: "Pending",
        date: new Date().toLocaleDateString('bn-BD'),
        createdAt: serverTimestamp()
      });

      setMessage({ text: "সফল! অর্ডার সফলভাবে সম্পন্ন হয়েছে!", color: "text-green-600" });
      
      setTimeout(() => {
        router.push("/orders"); // Next.js রাউটার দিয়ে পেজ পরিবর্তন
      }, 1200);

    } catch (error) {
      console.error("Error: ", error);
      setMessage({ text: "সমস্যা হয়েছে: " + error.message, color: "text-red-600" });
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-5 font-sans flex items-center justify-center">
      <div className="max-w-[450px] w-full mx-auto bg-white p-6 rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.06)]">
        
        <h2 className="text-[#d9363e] mb-5 text-center text-[20px] font-bold">🛍️ অর্ডার কনফার্ম করুন</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block font-bold mb-1.5 text-[13px] text-[#333]">আপনার নাম:</label>
            <input 
              type="text" 
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              required 
              placeholder="যেমন: Md Hanifa"
              className="w-full p-2.5 border border-[#ddd] rounded-[8px] text-[14px] outline-none bg-white text-black"
            />
          </div>

          <div className="form-group">
            <label className="block font-bold mb-1.5 text-[13px] text-[#333]">মোবাইল নম্বর (যেটি দিয়ে অর্ডার ট্র্যাক করবেন):</label>
            <input 
              type="text" 
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              required 
              placeholder="যেমন: 01835302525"
              className="w-full p-2.5 border border-[#ddd] rounded-[8px] text-[14px] outline-none bg-white text-black"
            />
          </div>

          <div className="form-group">
            <label className="block font-bold mb-1.5 text-[13px] text-[#333]">প্রোডাক্টের নাম:</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required 
              placeholder="যেমন: Real Madrid Jersey"
              className="w-full p-2.5 border border-[#ddd] rounded-[8px] text-[14px] outline-none bg-white text-black"
            />
          </div>

          <div className="form-group">
            <label className="block font-bold mb-1.5 text-[13px] text-[#333]">মূল্য (SAR):</label>
            <input 
              type="number" 
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required 
              placeholder="যেমন: 120"
              className="w-full p-2.5 border border-[#ddd] rounded-[8px] text-[14px] outline-none bg-white text-black"
            />
          </div>

          <div className="form-group">
            <label className="block font-bold mb-1.5 text-[13px] text-[#333]">পূর্ণ ঠিকানা:</label>
            <textarea 
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              required 
              placeholder="আপনার এলাকার নাম, রোড, বাসা নম্বর..."
              className="w-full p-2.5 border border-[#ddd] rounded-[8px] text-[14px] outline-none resize-vertical h-[80px] bg-white text-black"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#d9363e] hover:bg-[#b52b32] text-white border-none p-3 text-[16px] font-bold rounded-[8px] cursor-pointer transition duration-200 disabled:opacity-50"
          >
            {submitting ? "অর্ডার সেভ হচ্ছে..." : "অর্ডার প্লেস করুন"}
          </button>

          {message.text && (
            <div className={`text-center mt-2.5 font-bold text-[14px] ${message.color}`}>
              {message.text}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
