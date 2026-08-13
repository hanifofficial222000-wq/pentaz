'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function SellerRegisterPage() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [gmail, setGmail] = useState('');
  const [address, setAddress] = useState('');
  const [brandName, setBrandName] = useState('');
  
  const [profileImg, setProfileImg] = useState(null);
  const [licenseImg, setLicenseImg] = useState(null);
  const [nidImg, setNidImg] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState('রেজিস্ট্রেশন সাবমিট করুন');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !number || !brandName || !profileImg || !licenseImg || !nidImg) {
      alert("দয়া করে নাম, নম্বর, ব্র্যান্ডের নাম এবং সবগুলো ছবি (প্রোফাইল, লাইসেন্স, এনআইডি) আপলোড করুন!");
      return;
    }

    setLoading(true);
    setBtnText("ছবিগুলো আপলোড হচ্ছে...");

    try {
      // ১. ফাইলগুলো ফায়ারবেস স্টোরেজে আপলোড করা
      const timeStampKey = Date.now();
      
      const profileRef = ref(storage, `sellers/profile_${timeStampKey}_${profileImg.name}`);
      const profileSnap = await uploadBytes(profileRef, profileImg);
      const profileUrl = await getDownloadURL(profileSnap.ref);

      const licenseRef = ref(storage, `sellers/license_${timeStampKey}_${licenseImg.name}`);
      const licenseSnap = await uploadBytes(licenseRef, licenseImg);
      const licenseUrl = await getDownloadURL(licenseSnap.ref);

      const nidRef = ref(storage, `sellers/nid_${timeStampKey}_${nidImg.name}`);
      const nidSnap = await uploadBytes(nidRef, nidImg);
      const nidUrl = await getDownloadURL(nidSnap.ref);

      setBtnText("আবেদন জমা হচ্ছে...");

      // ২. pending_sellers কালেকশনে ডেটা সেভ করা
      await addDoc(collection(db, "pending_sellers"), {
        firstName,
        lastName,
        number,
        gmail,
        address,
        brandName,
        profileUrl,
        licenseUrl,
        nidUrl,
        status: 'Pending', // অ্যাডমিন এপ্রুভ না করা পর্যন্ত পেন্ডিং থাকবে
        createdAt: serverTimestamp()
      });

      alert("🎉 আপনার সেলার রেজিস্ট্রেশন সফলভাবে সাবমিট হয়েছে! অ্যাডমিন যাচাই করে এপ্রুভ করলে আপনি SMS বা কলের মাধ্যমে আপডেট পাবেন।");
      router.push('/');

    } catch (err) {
      console.error(err);
      alert("রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
      setBtnText("রেজিস্ট্রেশন সাবমিট করুন");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 font-sans">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="border-b pb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-800">🛍️ সেলার অ্যাকাউন্ট রেজিস্ট্রেশন</h2>
          <Link href="/" className="text-xs font-bold text-red-600 no-underline">← হোম</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">প্রথম নাম (First Name)</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="যেমন: Abu" className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">শেষ নাম (Last Name)</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="যেমন: Hanifa" className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (Phone Number)</label>
            <input type="tel" value={number} onChange={(e) => setNumber(e.target.value)} required placeholder="018XXXXXXXX" className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">জিমেইল (Gmail Address)</label>
            <input type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} placeholder="example@gmail.com" className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">কোম্পানি নাম / ব্র্যান্ড নাম (Brand Name)</label>
            <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} required placeholder="যেমন: Ayaat Sports" className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণ ঠিকানা (Address)</label>
            <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="আপনার দোকান বা ব্যবসার ঠিকানা..." className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-red-600"></textarea>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">👤 প্রোফাইল আইকন / ছবি (Profile Icon)</label>
              <input type="file" accept="image/*" onChange={(e) => setProfileImg(e.target.files[0])} required className="text-xs text-slate-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">📜 ট্রেড লাইসেন্স বা সার্টিফিকেট ছবি (Licence Image)</label>
              <input type="file" accept="image/*" onChange={(e) => setLicenseImg(e.target.files[0])} required className="text-xs text-slate-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">🆔 এনআইডি কার্ড ছবি (National ID Card)</label>
              <input type="file" accept="image/*" onChange={(e) => setNidImg(e.target.files[0])} required className="text-xs text-slate-500" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50">
            {btnText}
          </button>
        </form>

      </div>
    </div>
  );
}
