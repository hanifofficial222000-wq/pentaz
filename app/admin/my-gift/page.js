'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function GiftManagement() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [offerType, setOfferType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState('🎁 নতুন গিফট প্রোডাক্ট যোগ করুন');

  const CLOUD_NAME = "b3gsgcpl";
  const UPLOAD_PRESET = "tho4ycz8";

  // ক্যাটেগরি এবং প্রোডাক্ট লোড করা
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      let categoriesSet = new Set();
      
      try {
        const catSnapshot = await getDocs(collection(db, "categories"));
        catSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name) categoriesSet.add(data.name);
          if (data.title) categoriesSet.add(data.title);
          if (data.category) categoriesSet.add(data.category);
        });
      } catch (err) {
        console.log("Categories collection empty.");
      }

      try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        prodSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category) categoriesSet.add(data.category);
        });
      } catch (err) {
        console.log("Products collection check skipped.");
      }

      setCategories(Array.from(categoriesSet));
    } catch (error) {
      console.error("Error loading categories: ", error);
    }
  };

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gifts"));
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProducts(list);
    } catch (error) {
      console.error("Error loading products: ", error);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    setUploadStatus('ইমেজ আপলোড হচ্ছে...');
    setLoading(true);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setUploadStatus('ইমেজ আপলোড সফল হয়েছে!');
        setLoading(false);
        return data.secure_url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('ইমেজ আপলোড ব্যর্থ হয়েছে!');
      setLoading(false);
      return null;
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      alert('দয়া করে একটি ক্যাটেগরি সিলেক্ট করুন!');
      return;
    }

    let finalImageUrl = imageUrl;
    if (imageFile) {
      const uploadedUrl = await uploadImageToCloudinary(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        return;
      }
    }

    if (!finalImageUrl && !productId) {
      alert('দয়া করে একটি প্রোডাক্ট ইমেজ সিলেক্ট করুন!');
      return;
    }

    try {
      if (productId) {
        const productRef = doc(db, "gifts", productId);
        const updateData = { category, title: name, price, offerType };
        if (finalImageUrl) updateData.imageUrl = finalImageUrl;
        
        await updateDoc(productRef, updateData);
        setProductId('');
        setFormTitle('🎁 নতুন গিফট প্রোডাক্ট যোগ করুন');
      } else {
        await addDoc(collection(db, "gifts"), {
          category,
          title: name,
          price,
          offerType,
          imageUrl: finalImageUrl,
          createdAt: Date.now()
        });
      }

      // ফর্ম রিসেট
      setCategory('');
      setName('');
      setPrice('');
      setOfferType('');
      setImageUrl('');
      setImageFile(null);
      setUploadStatus('');
      loadProducts();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert('ডাটা সংরক্ষণ করতে সমস্যা হয়েছে!');
    }
  };

  const handleEdit = (prod) => {
    setProductId(prod.id);
    setCategory(prod.category || '');
    setName(prod.title || prod.name || '');
    setPrice(prod.price || '');
    setOfferType(prod.offerType || '');
    setImageUrl(prod.imageUrl || prod.image || '');
    setFormTitle('✏️ প্রোডাক্ট এডিট করুন');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('আপনি কি এই গিফট প্রোডাক্টটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(db, "gifts", id));
        loadProducts();
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert('ডিলিট করতে সমস্যা হয়েছে!');
      }
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-gradient-to-r from-orange-600 via-slate-800 to-slate-900 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Gift & Award Management</h1>
          </div>
          <Link href="/admin" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 backdrop-blur-md transition flex items-center gap-2 shrink-0 shadow-lg no-underline">
            <span>← কন্ট্রোল রুম</span>
          </Link>
        </div>

        {/* Product Add / Edit Form */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl mb-8">
          <h2 className="text-lg font-bold text-orange-400 mb-5 flex items-center gap-2">
            <span>{formTitle.includes('এডিট') ? '✏️' : '🎁'}</span> {formTitle}
          </h2>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ক্যাটেগরি সিলেক্ট করুন</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition"
              >
                <option value="">ক্যাটেগরি সিলেক্ট করুন</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্টের নাম</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" 
                placeholder="যেমন: স্পেশাল জার্সি বা উইনিং প্রাইজ" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">মূল্য (৳) <span class="text-slate-500 font-normal">(ঐচ্ছিক)</span></label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" 
                  placeholder="00" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">অফার টাইপ (Offer Type)</label>
                <input 
                  type="text" 
                  value={offerType} 
                  onChange={(e) => setOfferType(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" 
                  placeholder="যেমন: Free / 30 Shares" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্ট ইমেজ (Choose File)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 transition cursor-pointer" 
              />
              {uploadStatus && <div className="text-xs text-orange-400 mt-1">{uploadStatus}</div>}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-orange-600/20 cursor-pointer"
              >
                {loading ? "অপেক্ষা করুন..." : "প্রোডাক্ট সেভ করুন"}
              </button>
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <span>📋</span> সকল গিফট প্রোডাক্ট লিস্ট
          </h2>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">কোনো গিফট প্রোডাক্ট যুক্ত করা হয়নি।</p>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700/80 gap-4 hover:border-slate-600 transition">
                  <div className="flex items-center gap-3.5">
                    <img src={prod.imageUrl || prod.image} className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0" alt="" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{prod.title || prod.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ক্যাটেগরি: <span className="text-amber-400 font-semibold">{prod.category || 'N/A'}</span> | 
                        মূল্য: <span className="text-orange-400 font-semibold">৳{prod.price || '0'}</span> | 
                        অফার: <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-orange-500/20">{prod.offerType || 'General'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(prod)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl text-xs font-bold transition border border-blue-500/20 cursor-pointer">এডিট</button>
                    <button onClick={() => handleDelete(prod.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition border border-red-500/20 cursor-pointer">ডিলিট</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
