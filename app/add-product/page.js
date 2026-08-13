'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function SellerRegistration() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    number: '',
    gmail: '',
    brandName: '',
    address: ''
  });

  const [profileImg, setProfileImg] = useState(null);
  const [licenseImg, setLicenseImg] = useState(null);
  const [nidImg, setNidImg] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          gmail: user.email || '',
          number: user.phoneNumber || ''
        }));
      } else {
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadToFirebaseStorage = async (file, folderName) => {
    try {
      const fileRef = ref(storage, `${folderName}/${currentUser.uid}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error("Storage Upload Error:", error);
      throw new Error(`ছবি আপলোড ব্যর্থ হয়েছে: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("দয়া করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন!");
      return;
    }

    if (!profileImg || !licenseImg || !nidImg) {
      alert("দয়া করে প্রফাইল ছবি, ট্রেড লাইসেন্স এবং এনআইডি কার্ডের ছবি সিলেক্ট করুন!");
      return;
    }

    setUploading(true);

    try {
      setUploadStatus('প্রোফাইল ছবি আপলোড হচ্ছে...');
      const profileUrl = await uploadToFirebaseStorage(profileImg, 'seller_profiles');

      setUploadStatus('ট্রেড লাইসেন্স আপলোড হচ্ছে...');
      const licenseUrl = await uploadToFirebaseStorage(licenseImg, 'seller_licenses');

      setUploadStatus('এনআইডি কার্ড আপলোড হচ্ছে...');
      const nidUrl = await uploadToFirebaseStorage(nidImg, 'seller_nids');

      setUploadStatus('তথ্য সেভ করা হচ্ছে...');
      
      const sellerDocRef = doc(db, "pending_sellers", currentUser.uid);

      await setDoc(sellerDocRef, {
        id: currentUser.uid,
        uid: currentUser.uid,
        ...formData,
        profileUrl,
        licenseUrl,
        nidUrl,
        status: 'Pending',
        createdAt: new Date()
      });

      setUploading(false);
      alert("🎉 আপনার রেজিস্ট্রেশন সফলভাবে সাবমিট হয়েছে! অ্যাডমিন অনুমোদন করার পর আপনি এক্সেস পাবেন।");
      
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        brandName: '',
        address: ''
      }));
      setProfileImg(null);
      setLicenseImg(null);
      setNidImg(null);

    } catch (err) {
      console.error("Submission Error:", err);
      alert("ত্রুটি: " + err.message);
      setUploading(false);
    }
  };

  if (loadingUser) {
    return <div className="text-center py-20 font-bold text-gray-500">লোড হচ্ছে...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <h3 className="text-sm font-bold text-red-600 mb-2">⚠️ আপনি লগইন করা নেই!</h3>
        <p className="text-xs text-gray-600 mb-4">সেলার অ্যাকাউন্ট তৈরি করতে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।</p>
        <Link href="/" className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold">হোমে ফিরে যান</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 font-sans pb-20">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-5 shadow-md">
        
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-sm font-extrabold text-gray-800">🛍️ সেলার অ্যাকাউন্ট রেজিস্ট্রেশন</h2>
          <Link href="/" className="text-xs text-red-600 font-bold">← হোম</Link>
        </div>

        <div className="mb-3 p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-800">
          লগইন করা অ্যাকাউন্ট: <b>{currentUser.email || currentUser.phoneNumber || currentUser.uid}</b>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700">প্রথম নাম (First Name)</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="font-bold text-gray-700">শেষ নাম (Last Name)</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700">মোবাইল নম্বর (Phone Number)</label>
            <input type="text" name="number" value={formData.number} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg bg-gray-50" />
          </div>

          <div>
            <label className="font-bold text-gray-700">জিমেইল (Gmail Address)</label>
            <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg bg-gray-50" />
          </div>

          <div>
            <label className="font-bold text-gray-700">কোম্পানি নাম / ব্র্যান্ড নাম (Brand Name)</label>
            <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg bg-gray-50" />
          </div>

          <div>
            <label className="font-bold text-gray-700">পূর্ণ ঠিকানা (Address)</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows="2" className="w-full mt-1 p-2 border rounded-lg bg-gray-50"></textarea>
          </div>

          <div className="border p-3 rounded-xl bg-gray-50 space-y-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">👤 প্রোফাইল আইকন / ছবি (Profile Icon)</label>
              <input type="file" accept="image/*" onChange={(e) => setProfileImg(e.target.files[0])} required className="text-[10px]" />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">📜 ট্রেড লাইসেন্স বা সার্টিফিকেট (Licence Image)</label>
              <input type="file" accept="image/*" onChange={(e) => setLicenseImg(e.target.files[0])} required className="text-[10px]" />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">🆔 এনআইডি কার্ড ছবি (National ID Card)</label>
              <input type="file" accept="image/*" onChange={(e) => setNidImg(e.target.files[0])} required className="text-[10px]" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className={`w-full py-3 rounded-xl font-bold text-white transition cursor-pointer ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {uploading ? uploadStatus : 'রেজিস্ট্রেশন সম্পন্ন করুন'}
          </button>
        </form>

      </div>
    </div>
  );
}
