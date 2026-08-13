'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';

// ১. মূল পেজ কম্পোনেন্ট যা Suspense বাউন্ডারি দিয়ে মোড়ানো থাকবে
export default function RewardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">লোডিং হচ্ছে...</div>}>
      <RewardContent />
    </Suspense>
  );
}

// ২. আসল কাউন্টডাউন এবং ফায়ারবেসে পয়েন্ট যুক্ত করার লজিক সম্পন্ন কম্পোনেন্ট
function RewardContent() {
  const searchParams = useSearchParams();
  const refPhone = searchParams.get('ref');

  const [timeLeft, setTimeLeft] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [statusText, setStatusText] = useState('দয়া করে নিচের সময় পর্যন্ত অপেক্ষা করুন...');

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          
          // ফায়ারবেসে পয়েন্ট সেভ করার ফাংশন কল করা
          if (refPhone) {
            updateFirebasePoints(refPhone);
          } else {
            setStatusText('🎉 সফলভাবে সম্পন্ন হয়েছে!');
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refPhone]);

  // ফায়ারবেসে পয়েন্ট আপডেট বা যোগ করার ফাংশন
  const updateFirebasePoints = async (phone) => {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", cleanPhone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // যদি ইউজার ডাটাবেসে থাকে, তবে তার কয়েন/পয়েন্ট ১০ বাড়িয়ে আপডেট করা
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const currentCoins = Number(userData.coins || userData.coinBalance || 0);
        
        await updateDoc(doc(db, "users", userDoc.id), {
          coins: currentCoins + 10,
          coinBalance: currentCoins + 10
        });
        
        setStatusText('🎉 সফল! আপনার অ্যাকাউন্টে ১০ কয়েন যোগ হয়েছে!');
      } else {
        // যদি ইউজার ডাটাবেসে না থাকে, তবে নতুন ডকুমেন্ট তৈরি করে ১০ কয়েন দিয়ে দেওয়া
        await setDoc(doc(collection(db, "users")), {
          phone: cleanPhone,
          coins: 10,
          coinBalance: 10,
          createdAt: new Date().toISOString()
        });
        
        setStatusText('🎉 সফল! আপনার নতুন অ্যাকাউন্টে ১০ কয়েন যোগ হয়েছে!');
      }

      // ব্যাকআপ হিসেবে লোকালস্টোরেজেও সেভ করে রাখা
      const pointKey = `user_points_${cleanPhone}`;
      const localPoints = parseInt(localStorage.getItem(pointKey) || "0", 10);
      localStorage.setItem(pointKey, (localPoints + 10).toString());

    } catch (error) {
      console.error("Firebase point update error:", error);
      setStatusText('⚠️ পয়েন্ট যোগ করতে সমস্যা হয়েছে, তবে টাইম শেষ!');
    }
  };

  return (
    <div className="bg-[#f8f9fa] flex items-center justify-center min-h-screen p-4 font-sans">
      <div className="bg-white w-full max-w-[400px] rounded-[16px] p-[25px_20px] text-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-[#eee]">
        
        <div className="text-[18px] font-bold text-[#e63946] mb-1.5">AYAAT SPORT SHOP</div>
        <div className="text-[13px] text-[#666] mb-5">রেফারেল পয়েন্ট আর্নিং পেজ</div>

        {!isCompleted ? (
          <div className="bg-[#fff5f5] border-2 border-dashed border-[#e63946] rounded-[12px] p-4 mb-5">
            <p className="text-[13px] font-bold text-[#333]">{statusText}</p>
            <div className="text-[32px] font-bold text-[#e63946] mt-1.5">{timeLeft}</div>
          </div>
        ) : (
          <div className="mb-4 text-[#28a745] font-bold text-[14px]">
            {statusText}
          </div>
        )}

        {/* স্পন্সরড অ্যাড / অফার সেকশন */}
        <div className="w-full h-[200px] bg-[#e9ecef] rounded-[10px] flex items-center justify-center text-[#495057] text-[14px] font-bold mb-5 border border-[#dee2e6]">
          📢 স্পন্সরড অ্যাড / অফার চলছে...
        </div>

        <Link 
          href="/" 
          className={`w-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-none py-3 rounded-[10px] text-[15px] font-bold no-underline cursor-pointer shadow-[0_4px_10px_rgba(37,211,102,0.3)] transition inline-block ${!isCompleted ? 'hidden' : 'block'}`}
        >
          🛍️ শপে ফিরে যান
        </Link>

      </div>
    </div>
  );
}
