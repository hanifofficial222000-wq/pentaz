'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CheckoutPage() {
  const router = useRouter();

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState('অর্ডার প্লেস করুন');

  // LocalStorage থেকে চেকআউট ডাটা লোড করা এবং ইউজার ফোন অটো-সেভ হ্যান্ডেল করা
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('checkoutProduct'));
    if (data) {
      setCheckoutProduct(data);
    }
    
    // পূর্বের কোনো সেভ করা ফোন নম্বর থাকলে তা ইনপুটে অটোফিল করার সুবিধা (ঐচ্ছিক)
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
      setCustPhone(savedPhone);
    }
  }, []);

  // অর্ডার সাবমিট হ্যান্ডলার
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      alert('দয়া করে আপনার নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন!');
      return;
    }

    // ফোন নম্বর সঠিক কিনা যাচাই (কমপক্ষে ৯ ডিজিট)
    const cleanPhone = custPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      alert('দয়া করে একটি সঠিক মোবাইল নম্বর লিখুন!');
      return;
    }

    if (!checkoutProduct) {
      alert('কোনো প্রোডাক্ট সিলেক্ট করা হয়নি!');
      return;
    }

    setLoading(true);
    setBtnText('অর্ডার সাবমিট হচ্ছে...');

    try {
      // ফায়ারবেসে অর্ডার সেভ করা
      await addDoc(collection(db, "orders"), {
        productTitle: checkoutProduct.title,
        productPrice: checkoutProduct.price,
        productId: checkoutProduct.id,
        customerName: custName.trim(),
        customerPhone: cleanPhone,
        customerAddress: custAddress.trim(),
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // ইউজারের ফোন নম্বর লোকালস্টোরেজে সেভ করে রাখা যাতে 'My Orders' পেজে অটো দেখতে পায়
      localStorage.setItem('userPhone', cleanPhone);
      let savedPhones = JSON.parse(localStorage.getItem("userPhones") || "[]");
      if (!savedPhones.includes(cleanPhone)) {
        savedPhones.push(cleanPhone);
        localStorage.setItem("userPhones", JSON.stringify(savedPhones));
      }

      alert('অভিনন্দন! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব।');
      
      // লোকাল স্টোরেজ থেকে চেকআউট, কার্ট এবং প্রিভিয়াস ডাটা মুছে ফেলা
      localStorage.removeItem('checkoutProduct');
      localStorage.removeItem('ayaat_cart');
      localStorage.removeItem('ayaat_previously_added'); 

      router.push('/my-orders'); // অর্ডার সফল হওয়ার পর সরাসরি My Orders পেজে রিডাইরেক্ট করা ভালো

    } catch (error) {
      console.error(error);
      alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setLoading(false);
      setBtnText('অর্ডার প্লেস করুন');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-5 flex items-center justify-center font-sans">
      <div className="max-w-[500px] w-full bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-100">
        
        <h2 className="text-[#e63946] mb-4 text-[20px] text-center font-extrabold">
          অর্ডার কনফার্ম করুন
        </h2>

        {/* Order Summary Box */}
        <div className="bg-slate-50 p-3.5 rounded-xl mb-4 text-[13px] text-[#333] border border-slate-200">
          {checkoutProduct ? (
            <>
              <div className="mb-1">
                <b className="text-slate-700">প্রোডাক্ট(সমূহ):</b> <span className="text-slate-900 font-semibold">{checkoutProduct.title}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                <span className="text-slate-600 font-bold">মোট দাম:</span>
                <span className="text-[#e63946] font-extrabold text-[15px]">SAR {checkoutProduct.price}</span>
              </div>
            </>
          ) : (
            <span className="text-[#e63946] font-semibold">কোনো প্রোডাক্ট সিলেক্ট করা হয়নি!</span>
          )}
        </div>

        {checkoutProduct ? (
          <form onSubmit={placeOrder}>
            <div className="mb-3">
              <label className="block text-[13px] font-bold mb-1.5 text-slate-700">আপনার নাম *</label>
              <input 
                type="text" 
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="পূর্ণ নাম লিখুন" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black focus:border-[#e63946] transition"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[13px] font-bold mb-1.5 text-slate-700">মোবাইল নম্বর (সৌদি নম্বর) *</label>
              <input 
                type="tel" 
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="उदा: 05xxxxxxxx" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black focus:border-[#e63946] transition"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-bold mb-1.5 text-slate-700">পূর্ণ ঠিকানা *</label>
              <textarea 
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="বাসা নং, ব্লক/স্ট্রিট, এলাকা, শহর (যেমন: রিয়াদ, জেদ্দা)" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black h-[80px] resize-vertical focus:border-[#e63946] transition"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#e63946] hover:bg-[#d62839] text-white border-none p-3 rounded-xl font-bold text-[15px] cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              {btnText}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-[#f27a1a] hover:bg-[#d96a15] text-white border-none p-3 rounded-xl font-bold text-[15px] cursor-pointer transition shadow-sm"
          >
            শপিং এ ফিরে যান
          </button>
        )}

      </div>
    </div>
  );
}
