'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase'; // firebase.js থেকে db এবং storage ইমপোর্ট করা হলো
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState('প্রোডাক্ট সাবমিট করুন');

  // ক্যাটেগরি লোড করা
  useEffect(() => {
    async function loadCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const list = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setCategories(list);
      } catch (err) {
        console.error("Categories Load Error:", err);
      }
    }
    loadCategories();
  }, []);

  // ইমেজ সিলেক্ট ও প্রিভিউ হ্যান্ডলার
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ফর্ম সাবমিট হ্যান্ডলার (Firebase Storage ব্যবহার করে)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !title || !price || !imageFile || !sellerName || !sellerPhone) {
      alert("দয়া করে প্রয়োজনীয় সকল তথ্য এবং প্রোডাক্টের ছবি দিন!");
      return;
    }

    setLoading(true);
    setBtnText("ছবি আপলোড হচ্ছে...");

    try {
      // Firebase Storage-এ ইমেজ আপলোড করার রেফারেন্স তৈরি
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      
      // ফাইল আপলোড
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // ডাউনলোডের জন্য পাবলিক URL সংগ্রহ করা
      const imageUrl = await getDownloadURL(snapshot.ref);

      setBtnText("পোস্ট হচ্ছে...");

      const formattedSizes = sizes ? sizes.split(',').map(s => s.trim()) : ['Standard'];

      // সরাসরি 'pending_products' কালেকশনে সেভ করা হচ্ছে
      await addDoc(collection(db, "pending_products"), {
        category: category,
        title: title,
        price: Number(price),
        imageUrl: imageUrl,
        imageUrls: [imageUrl],
        sizes: formattedSizes,
        description: description,
        sellerName: sellerName,
        sellerPhone: sellerPhone,
        approved: false,
        createdAt: serverTimestamp()
      });

      alert("🎉 আপনার প্রোডাক্টটি সফলভাবে পোস্ট করা হয়েছে! অ্যাডমিন এপ্রুভ করলে এটি ওয়েবসাইটে দেখা যাবে।");
      router.push("/"); 

    } catch (err) {
      console.error(err);
      alert("প্রোডাক্ট পোস্ট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন!");
    } finally {
      setLoading(false);
      setBtnText("প্রোডাক্ট সাবমিট করুন");
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-4 pb-[50px] font-sans">
      <div className="max-w-[500px] mx-auto bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        
        {/* Back Link */}
        <Link href="/" className="text-[#333] no-underline text-[14px] inline-block mb-4 font-bold hover:text-[#e63946] transition">
          ← Back to Shop
        </Link>

        <h2 className="text-[20px] mb-4 text-[#222] text-center border-b-2 border-dashed border-[#eee] pb-2.5">
          🛍️ আপনার প্রোডাক্ট পোস্ট করুন
        </h2>

        <form onSubmit={handleSubmit}>
          
          {/* Category */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">ক্যাটাগরি সিলেক্ট করুন:</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.length === 0 ? (
                <option value="" disabled>ক্যাটাগরি লোড হচ্ছে...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.name.toLowerCase().trim()}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">প্রোডাক্টের নাম:</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: Bangladesh Cricket Jersey" 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">মূল্য (SAR / ৳):</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="যেমন: 300" 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">প্রোডাক্টের ছবি সিলেক্ট করুন:</label>
            <div className="border-2 border-dashed border-[#e63946] p-4 text-center rounded-lg bg-[#fff5f5]">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="block w-full text-[14px] text-[#e63946] cursor-pointer"
              />
            </div>
            {imagePreview && (
              <div className="flex flex-wrap gap-2 justify-center mt-2.5">
                <img src={imagePreview} alt="Preview" className="w-[70px] h-[70px] object-cover rounded-md border border-[#ccc]" />
              </div>
            )}
            <p className="text-[11px] text-[#666] mt-1.5">দয়া করে প্রোডাক্টের একটি ছবি সিলেক্ট করুন।</p>
          </div>

          {/* Sizes */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">সাইজ সমুহ (কমা দিয়ে লিখুন):</label>
            <input 
              type="text" 
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="M, L, XL, XXL"
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="font-bold block mb-1.5 text-[14px] text-[#333]">প্রোডাক্টের বিবরণ/ডেসক্রিপশন:</label>
            <textarea 
              rows="3" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
            ></textarea>
          </div>

          {/* Seller Section */}
          <div className="bg-[#f0f7ff] border border-[#cce5ff] p-4 rounded-lg mb-4">
            <h3 className="text-[14px] text-[#004085] mb-2.5 font-bold">👤 বিক্রেতার তথ্য (Seller Info)</h3>
            <div className="mb-3">
              <label className="font-bold block mb-1.5 text-[14px] text-[#333]">আপনার নাম:</label>
              <input 
                type="text" 
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="বিক্রেতার নাম" 
                required
                className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
              />
            </div>
            <div className="mb-0">
              <label className="font-bold block mb-1.5 text-[14px] text-[#333]">মোবাইল / ওয়াটসঅ্যাপ নম্বর:</label>
              <input 
                type="tel" 
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="018XXXXXXXX" 
                required
                className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white text-black focus:border-[#e63946]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3.5 bg-[#e63946] hover:bg-[#d62839] text-white border-none rounded-lg font-bold text-[16px] cursor-pointer transition disabled:opacity-50"
          >
            {btnText}
          </button>
        </form>

      </div>
    </div>
  );
}
