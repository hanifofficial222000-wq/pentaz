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

  // LocalStorage থেকে চেকআউট ডাটা লোড করা
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('checkoutProduct'));
    if (data) {
      setCheckoutProduct(data);
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
    if (custPhone.trim().length < 9) {
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
      await addDoc(collection(db, "orders"), {
        productTitle: checkoutProduct.title,
        productPrice: checkoutProduct.price,
        productId: checkoutProduct.id,
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        customerAddress: custAddress.trim(),
        status: "Pending",
        createdAt: serverTimestamp()
      });

      alert('অভিনন্দন! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব।');
      
      // লোকাল স্টোরেজ থেকে চেকআউট, কার্ট এবং প্রিভিয়াস ডাটা মুছে ফেলা
      localStorage.removeItem('checkoutProduct');
      localStorage.removeItem('ayaat_cart');
      localStorage.removeItem('ayaat_previously_added'); 

      router.push('/'); // হোমপেজে রিডাইরেক্ট করা

    } catch (error) {
      console.error(error);
      alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setLoading(false);
      setBtnText('অর্ডার প্লেস করুন');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-5 flex items-center justify-center font-sans">
      <div className="max-w-[500px] w-full bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        
        <h2 className="text-[#e63946] mb-4 text-[20px] text-center font-bold">
          অর্ডার কনফার্ম করুন
        </h2>

        {/* Order Summary Box */}
        <div className="bg-[#f1f3f5] p-3 rounded-lg mb-4 text-[13px] text-[#333]">
          {checkoutProduct ? (
            <>
              <b className="text-black">প্রোডাক্ট(সমূহ):</b> {checkoutProduct.title}<br />
              <b className="text-black">মোট দাম:</b> SAR {checkoutProduct.price}
            </>
          ) : (
            <span className="text-[#e63946] font-semibold">কোনো প্রোডাক্ট সিলেক্ট করা হয়নি!</span>
          )}
        </div>

        {checkoutProduct ? (
          <form onSubmit={placeOrder}>
            <div className="mb-3">
              <label className="block text-[13px] font-bold mb-1.5 text-[#333]">আপনার নাম *</label>
              <input 
                type="text" 
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="পূর্ণ নাম লিখুন" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black focus:border-[#e63946]"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[13px] font-bold mb-1.5 text-[#333]">মোবাইল নম্বর *</label>
              <input 
                type="tel" 
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="মোবাইল নম্বর লিখুন" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black focus:border-[#e63946]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-bold mb-1.5 text-[#333]">পূর্ণ ঠিকানা *</label>
              <textarea 
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="বাসা নং, রোড, এলাকা, শহর" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-lg text-[14px] outline-none bg-white text-black h-[80px] resize-vertical focus:border-[#e63946]"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#e63946] hover:bg-[#d62839] text-white border-none p-3 rounded-lg font-bold text-[15px] cursor-pointer transition disabled:opacity-50"
            >
              {btnText}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-[#f27a1a] text-white border-none p-3 rounded-lg font-bold text-[15px] cursor-pointer"
          >
            শপিং এ ফিরে যান
          </button>
        )}

      </div>
    </div>
  );
}
