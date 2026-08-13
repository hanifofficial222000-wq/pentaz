'use client';

import React, { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function SellerRegistration() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ফায়ারবেস স্টোরেজে ফাইল আপলোড করার ফাংশন
  const uploadToFirebaseStorage = async (file, folderName) => {
    try {
      const fileRef = ref(storage, `${folderName}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error("Storage Upload Error:", error);
      throw new Error("ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileImg || !licenseImg || !nidImg) {
      alert("দয়া করে প্রফাইল ছবি, ট্রেড লাইসেন্স এবং এনআইডি কার্ডের ছবি সিলেক্ট করুন!");
      return;
    }

    setUploading(true);
    setUploadStatus('ছবিগুলো আপলোড হচ্ছে...');

    try {
      // ১. ফায়ারবেস স্টোরেজে একে একে ছবি আপলোড করা
      setUploadStatus('প্রোফাইল ছবি আপলোড হচ্ছে...');
      const profileUrl = await uploadToFirebaseStorage(profileImg, 'seller_profiles');

      setUploadStatus('ট্রেড লাইসেন্স আপলোড হচ্ছে...');
      const licenseUrl = await uploadToFirebaseStorage(licenseImg, 'seller_licenses');

      setUploadStatus('এনআইডি কার্ড আপলোড হচ্ছে...');
      const nidUrl = await uploadToFirebaseStorage(nidImg, 'seller_nids');

      setUploadStatus('ফায়ারস্টোরে তথ্য সেভ করা হচ্ছে...');
      const sellerId = `seller_${Date.now()}`;

      // ২. ফায়ারস্টোর ডাটাবেসের 'pending_sellers' কালেকশনে ডাটা সেভ করা
      await setDoc(doc(db, "pending_sellers", sellerId), {
        id: sellerId,
        ...formData,
        profileUrl,
        licenseUrl,
        nidUrl,
        status: 'Pending',
        createdAt: new Date()
      });

      setUploading(false);
      alert("🎉 আপনার রেজিস্ট্রেশন সফলভাবে সাবমিট হয়েছে! অ্যাডমিন অনুমোদন করার পর আপনি এক্সেস পাবেন।");
      
      // ফর্ম রিসেট
      setFormData({ firstName: '', lastName: '', number: '', gmail: '', brandName: '', address: '' });
      setProfileImg(null);
      setLicenseImg(null);
      setNidImg(null);

    } catch (err) {
      console.error("Submission Error:", err);
      alert("ত্রুটি: " + err.message);
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 font-sans pb-20">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-5 shadow-md">
        
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-sm font-extrabold text-gray-800">🛍️ সেলার অ্যাকাউন্ট রেজিস্ট্রেশন</h2>
          <Link href="/" className="text-xs text-red-600 font-bold">← হোম</Link>
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
