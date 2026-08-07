'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { doc, getDoc } from 'firebase/firestore';

export default function MyAddressPage() {
  const [userData, setUserData] = useState({
    name: 'লোড হচ্ছে...',
    address: 'লোড হচ্ছে...',
    phone: 'লোড হচ্ছে...'
  });

  useEffect(() => {
    async function fetchAddress() {
      // প্রথমে লোকালস্টোরেজ থেকে ইউজার ডাটা চেক করা
      const localUserStr = localStorage.getItem('ayaat_user');
      
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        
        // লোকালস্টোরেজ থেকে প্রাথমিক ডাটা সেট করা
        setUserData({
          name: localUser.name || "প্রদান করা হয়নি",
          address: localUser.address || "ঠিকানা দেওয়া হয়নি",
          phone: localUser.phone || "নম্বর দেওয়া হয়নি"
        });

        // ফায়ারস্টোর থেকে লেটেস্ট ডাটা ফেচ করে আপডেট রাখা
        if (localUser.phone) {
          try {
            const userId = localUser.uid || ('user_' + localUser.phone);
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const firestoreData = docSnap.data();
              setUserData({
                name: firestoreData.name || "প্রদান করা হয়নি",
                address: firestoreData.address || "ঠিকানা দেওয়া হয়নি",
                phone: firestoreData.phone || "নম্বর দেওয়া হয়নি"
              });
            }
          } catch (error) {
            console.error("Error fetching address from Firebase:", error);
          }
        }
      } else {
        // যদি ইউজার লগইন করা না থাকে
        setUserData({
          name: "প্রদান করা হয়নি",
          address: "ঠিকানা দেওয়া হয়নি",
          phone: "নম্বর দেওয়া হয়নি"
        });
      }
    }

    fetchAddress();
  }, []);

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-[15px] text-[#333] font-sans">
      <div className="max-w-[500px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center bg-white p-[15px] rounded-[12px] mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <Link 
            href="/" 
            className="no-underline text-[#333] text-[14px] font-bold bg-[#f1f3f5] px-[12px] py-[6px] rounded-[8px] mr-[15px]"
          >
            ← ব্যাক
          </Link>
          <h2 className="text-[16px] text-[#333] font-bold m-0">My Delivery Address</h2>
        </div>

        {/* Dynamic Address Card */}
        <div className="bg-white p-[20px] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[14px] leading-[1.8] text-[#444] border border-[#eaeaea]">
          <b className="text-[#e63946] text-[15px] block mb-[8px]">🏠 হোম ডেলিভারি ঠিকানা:</b>
          
          <p className="mb-1">
            <b className="text-black font-semibold inline">নাম:</b> <span>{userData.name}</span>
          </p>
          <p className="mb-1">
            <b className="text-black font-semibold inline">ঠিকানা:</b> <span>{userData.address}</span>
          </p>
          <p className="mb-1">
            <b className="text-black font-semibold inline">মোবাইল:</b> <span>{userData.phone}</span>
          </p>
          
          <Link 
            href="/my-details" 
            className="block w-full bg-[#e63946] text-white border-none p-[12px] rounded-[10px] font-bold text-[14px] cursor-pointer text-center no-underline mt-[15px] transition duration-200 hover:bg-[#c52a36]"
          >
            ঠিকানা পরিবর্তন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
