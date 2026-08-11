'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ১. মূল এক্সপোর্ট করা পেজ কম্পোনেন্ট যা Suspense বাউন্ডারি দিয়ে মোড়ানো থাকবে
export default function MyDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">লোড হচ্ছে...</div>}>
      <DetailsContent />
    </Suspense>
  );
}

// ২. আসল লজিক এবং ইউজার ইন্টারফেস কম্পোনেন্ট
function DetailsContent() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState('পরিবর্তন সেভ করুন');
  const [showAlert, setShowAlert] = useState(false);

  // পেজ লোড হলে লোকালস্টোরেজ ও ফায়ারস্টোর থেকে ডাটা ফেচ করা
  useEffect(() => {
    async function loadUserData() {
      const localUserStr = localStorage.getItem('ayaat_user');
      
      if (!localUserStr) {
        alert('দয়া করে প্রথমে লগইন বা রেজিস্ট্রেশন করুন!');
        router.push('/');
        return;
      }

      const localUser = JSON.parse(localUserStr);
      
      if (!localUser.phone) {
        alert('দয়া করে প্রথমে লগইন বা রেজিস্ট্রেশন করুন!');
        router.push('/');
        return;
      }

      // ফর্ম ফিল্ডগুলোতে লোকাল ডাটা সেট করা
      setFirstName(localUser.firstName || '');
      setLastName(localUser.lastName || '');
      setManualPhone(localUser.phone || '');
      setManualAddress(localUser.address || '');

      // ফায়ারস্টোর থেকে লেটেস্ট ডাটা ফেচ করে সিংক রাখা
      try {
        const userId = localUser.uid || ('user_' + localUser.phone);
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          setFirstName(firestoreData.firstName || '');
          setLastName(firestoreData.lastName || '');
          setManualPhone(firestoreData.phone || '');
          setManualAddress(firestoreData.address || '');
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }

    loadUserData();
  }, [router]);

  // আপডেট বা সাবমিট ফাংশন
  const updateUserProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBtnText('আপডেট হচ্ছে...');

    try {
      const localUser = JSON.parse(localStorage.getItem('ayaat_user')) || {};
      const userId = localUser.uid || ('user_' + manualPhone);
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // নতুন আপডেট অবজেক্ট (ছবি ছাড়া)
      const updatedUserData = {
        ...localUser,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        phone: manualPhone.trim(),
        address: manualAddress.trim(),
        uid: userId
      };

      // ফায়ারস্টোরে ডেটা আপডেট করা
      await setDoc(doc(db, "users", userId), updatedUserData, { merge: true });

      // লোকালস্টোরেজ আপডেট করা
      localStorage.setItem('ayaat_user', JSON.stringify(updatedUserData));

      // সফল মেসেজ দেখানো এবং ১.৫ সেকেন্ড পর ড্যাশবোর্ডে রিডাইরেক্ট করা
      setShowAlert(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      alert('আপডেট করতে সমস্যা হয়েছে: ' + error.message);
      setLoading(false);
      setBtnText('পরিবর্তন সেভ করুন');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      <div className="max-w-[500px] mx-auto my-[15px] px-[15px]">
        
        <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-5 border-b border-[#eee] pb-3">
            <Link 
              href="/" 
              className="no-underline text-[#333] text-[13px] font-bold bg-[#f1f3f5] px-3 py-1.5 rounded-[8px]"
            >
              ← ব্যাক
            </Link>
            <span className="text-[16px] font-bold text-[#333]">👤 ব্যক্তিগত তথ্য</span>
            <div></div>
          </div>

          {/* Alert Box */}
          {showAlert && (
            <div className="p-2.5 rounded-[8px] text-center text-[13px] font-bold mb-4 bg-[#d4edda] text-[#155724] border border-[#c3e6cb]">
              🎉 তথ্য সফলভাবে আপডেট করা হয়েছে!
            </div>
          )}

          <form onSubmit={updateUserProfile}>
            
            {/* First Name & Last Name */}
            <div className="flex gap-2.5 mb-4">
              <div className="flex-1 text-left">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">First Name:</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="প্রথম নাম" 
                  required
                  className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] transition duration-200 focus:border-[#e63946] focus:bg-white text-black"
                />
              </div>
              <div className="flex-1 text-left">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">Last Name:</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="শেষ নাম" 
                  required
                  className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] transition duration-200 focus:border-[#e63946] focus:bg-white text-black"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="text-left mb-4">
              <label className="text-[13px] font-bold block mb-1 text-[#333]">ফোন নম্বর:</label>
              <input 
                type="tel" 
                value={manualPhone} 
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="০১৮xxxxxxxx" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] transition duration-200 focus:border-[#e63946] focus:bg-white text-black"
              />
            </div>

            {/* Address Box */}
            <div className="text-left mb-4">
              <label className="text-[13px] font-bold block mb-1 text-[#333]">ঠিকানা (Address):</label>
              <textarea 
                rows="2" 
                value={manualAddress} 
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন" 
                required
                className="w-full p-2.5 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] transition duration-200 focus:border-[#e63946] focus:bg-white text-black resize-y"
              ></textarea>
            </div>

            {/* Update Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white border-none p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition duration-200 mt-1 disabled:opacity-50"
            >
              {btnText}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
