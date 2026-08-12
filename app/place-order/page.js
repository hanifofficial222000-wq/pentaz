'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PlaceOrderPage() {
  const router = useRouter();
  
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custSize, setCustSize] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const name = custName.trim();
    const phone = custPhone.trim();
    const prodName = productName.trim();
    const price = Number(productPrice);
    const address = custAddress.trim();
    const size = custSize.trim() || 'N/A';

    setSubmitting(true);
    setMessage({ text: '', color: '' });

    try {
      // ব্রাউজারের লোকালস্টোরেজে ফোন নম্বরটি সেভ করে রাখা হলো
      localStorage.setItem("userPhone", phone);

      // ফায়ারবেসে ডেটা পাঠানো (অন্যান্য পেজের অর্ডার কাঠামোর সাথে সামঞ্জস্যপূর্ণ)
      await addDoc(collection(db, "orders"), {
        orderId: 'ORD_' + Math.floor(100000 + Math.random() * 900000),
        customerName: name,
        phone: phone,
        custPhone: phone, 
        customerPhone: phone,
        productName: prodName,
        productTitle: prodName,
        price: price,
        productPrice: price,
        address: address,
        customerAddress: address,
        size: size,
        customerSize: size,
        color: 'N/A',
        status: "Pending",
        date: new Date().toLocaleDateString('bn-BD'),
        createdAt: serverTimestamp()
      });

      setMessage({ text: "🎉 সফল! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!", color: "text-green-600" });
      
      setTimeout(() => {
        router.push("/orders"); // অর্ডার ট্র্যাক পেজে রিডাইরেক্ট
      }, 1200);

    } catch (error) {
      console.error("Error: ", error);
      setMessage({ text: "⚠️ সমস্যা হয়েছে: " + error.message, color: "text-red-600" });
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-4 font-sans flex flex-col justify-center">
      
      <div className="max-w-[450px] w-full mx-auto bg-white p-6 rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100">
        
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-slate-600 hover:text-[#d9363e] text-xs font-bold transition no-underline">
            ← হোম
          </Link>
          <span className="text-[11px] bg-red-50 text-[#d9363e] px-2.5 py-1 rounded-full font-bold">AYAAT SHOP</span>
        </div>

        <h2 className="text-[#d9363e] mb-5 text-center text-[18px] font-extrabold">🛍️ অর্ডার কনফার্ম করুন</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-bold mb-1 text-[13px] text-[#333]">আপনার নাম:</label>
            <input 
              type="text" 
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              required 
              placeholder="যেমন: Md Hanifa"
              className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-[13px] text-[#333]">মোবাইল নম্বর (অর্ডার ট্র্যাক করার জন্য):</label>
            <input 
              type="tel" 
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              required 
              placeholder="যেমন: 01835302525"
              className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-[13px] text-[#333]">প্রোডাক্টের নাম:</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required 
              placeholder="যেমন: Real Madrid Jersey"
              className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1 text-[13px] text-[#333]">মূল্য (৳):</label>
              <input 
                type="number" 
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required 
                placeholder="যেমন: 1200"
                className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[13px] text-[#333]">সাইজ (যদি থাকে):</label>
              <input 
                type="text" 
                value={custSize}
                onChange={(e) => setCustSize(e.target.value)}
                placeholder="যেমন: M / L / XL"
                className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[13px] text-[#333]">পূর্ণ ঠিকানা:</label>
            <textarea 
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              required 
              rows="2"
              placeholder="আপনার এলাকার নাম, রোড, বাসা নম্বর..."
              className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-white text-black focus:border-[#d9363e]"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#d9363e] hover:bg-[#b52b32] text-white border-none p-3 text-[15px] font-bold rounded-[10px] cursor-pointer transition duration-200 disabled:opacity-50 shadow-sm"
          >
            {submitting ? "অর্ডার সেভ হচ্ছে..." : "🛒 অর্ডার প্লেস করুন"}
          </button>

          {message.text && (
            <div className={`text-center mt-2 font-bold text-[13px] ${message.color}`}>
              {message.text}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
