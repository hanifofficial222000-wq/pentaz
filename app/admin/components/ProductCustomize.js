'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductCustomize() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sizes, setSizes] = useState('');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  
  const [loading, setLoading] = useState(false);

  // ফায়ারবেস থেকে ক্যাটাগরি লোড করা
  useEffect(() => {
    async function loadCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        if (!querySnapshot.empty) {
          const catList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCategories(catList);
        }
      } catch (err) {
        console.error("Categories Load Error:", err);
      }
    }
    loadCategories();
  }, []);

  // ফর্ম সাবমিশন ও ফায়ারবেসে ডেটা সেভ করা
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !title || !price || !imageUrl || !sellerName || !sellerPhone) {
      alert("দয়া করে প্রয়োজনীয় সকল তথ্য এবং প্রোডাক্টের ছবির লিংক দিন!");
      return;
    }

    setLoading(true);

    try {
      const formattedSizes = sizes ? sizes.split(',').map(s => s.trim()) : ['Standard'];

      await addDoc(collection(db, "products"), {
        category: selectedCategory,
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
      
      // ফর্ম রিসেট
      setSelectedCategory('');
      setTitle('');
      setPrice('');
      setImageUrl('');
      setSizes('');
      setDescription('');
      setSellerName('');
      setSellerPhone('');
      
    } catch (err) {
      console.error(err);
      alert("প্রোডাক্ট পোস্ট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-4 pb-12 font-sans">
      <div className="max-w-[500px] mx-auto bg-white rounded-xl p-5 shadow-md">
        
        <Link href="/admin" className="text-[#333] no-underline text-sm inline-block mb-4 font-bold hover:text-[#e63946] transition duration-200">
          ← Back to Admin Panel
        </Link>

        <h2 className="text-[20px] mb-4 text-[#222] text-center border-b-2 border-dashed border-[#eee] pb-2 font-bold">
          🛍️ আপনার প্রোডাক্ট পোস্ট করুন
        </h2>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">ক্যাটাগরি সিলেক্ট করুন:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name.toLowerCase().trim()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">প্রোডাক্টের নাম:</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: Bangladesh Cricket Jersey" 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            />
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">মূল্য (SAR / ৳):</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              placeholder="যেমন: 300" 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            />
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">প্রোডাক্টের ছবির লিংক (Image URL):</label>
            <input 
              type="url" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg" 
              required
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            />
            {imageUrl && (
              <div className="flex justify-center mt-2.5">
                <img src={imageUrl} alt="Preview" className="w-[70px] h-[70px] object-cover rounded-md border border-[#ccc]" onError={(e)=>{e.target.style.display='none'}} />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">সাইজ সমুহ (কমা দিয়ে লিখুন):</label>
            <input 
              type="text" 
              value={sizes} 
              onChange={(e) => setSizes(e.target.value)}
              placeholder="M, L, XL, XXL"
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            />
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-1 text-sm text-[#333]">প্রোডাক্টের বিবরণ/ডেসক্রিপশন:</label>
            <textarea 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
              className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
            ></textarea>
          </div>

          <div className="bg-[#f0f7ff] border border-[#cce5ff] p-4 rounded-lg mb-4">
            <h3 className="text-sm text-[#004085] mb-2.5 font-bold">👤 বিক্রেতার তথ্য (Seller Info)</h3>
            <div className="mb-3">
              <label className="font-bold block mb-1 text-sm text-[#333]">আপনার নাম:</label>
              <input 
                type="text" 
                value={sellerName} 
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="বিক্রেতার নাম" 
                required
                className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
              />
            </div>
            <div className="mb-0">
              <label className="font-bold block mb-1 text-sm text-[#333]">মোবাইল / ওয়াটসঅ্যাপ নম্বর:</label>
              <input 
                type="tel" 
                value={sellerPhone} 
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="018XXXXXXXX" 
                required
                className="w-full p-3 border border-[#ddd] rounded-lg text-[15px] outline-none bg-white focus:border-[#e63946] text-black"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3.5 bg-[#e63946] text-white border-none rounded-lg font-bold text-base cursor-pointer transition duration-300 hover:bg-[#d62839]"
          >
            {loading ? "পোস্ট হচ্ছে..." : "প্রোডাক্ট সাবমিট করুন"}
          </button>

        </form>
      </div>
    </div>
  );
}
