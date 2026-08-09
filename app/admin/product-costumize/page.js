'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function ProductManagement() {
  const cloudName = "b3gsgcpl";
  const uploadPreset = "tho4ycz8";

  const [allMainCategories, setAllMainCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [sizes, setSizes] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({ show: false, msg: '' });
  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const mainSnap = await getDocs(collection(db, "mainCategories"));
        const mainList = [];
        mainSnap.forEach(d => mainList.push({ id: d.id, ...d.data() }));
        setAllMainCategories(mainList);

        const subSnap = await getDocs(collection(db, "subCategories"));
        const subList = [];
        subSnap.forEach(d => subList.push({ id: d.id, ...d.data() }));
        setAllSubCategories(subList);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleMainCatChange = (e) => {
    const mainCat = e.target.value;
    setSelectedMainCat(mainCat);
    setSelectedSubCat('');

    const filtered = allSubCategories.filter(s => s.mainCat === mainCat);
    setFilteredSubCategories(filtered);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl('');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile) {
      alert("দয়া করে ছবি সিলেক্ট করুন!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedImageFile);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudData = await res.json();
      if (!cloudData.secure_url) throw new Error("Image Upload Failed");

      const sizesArray = sizes ? sizes.split(',').map(s => s.trim()).filter(s => s !== '') : [];

      await addDoc(collection(db, "products"), {
        title: title.trim(),
        price: Number(price),
        discount: discount ? Number(discount) : null,
        mainCategory: selectedMainCat,
        category: selectedSubCat, // সাব-ক্যাটাগরির আসল নাম সেভ হবে
        subCategory: selectedSubCat, // ব্যাকআপের জন্য উভয় ফিল্ড রাখা হলো
        sizes: sizesArray,
        description: description.trim(),
        imageUrl: cloudData.secure_url,
        sellerName: 'AYAAT SPORT SHOP',
        sellerPhone: '01835302525',
        approved: true,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 প্রোডাক্ট সফলভাবে পাবলিশ হয়েছে!");
      setTitle('');
      setPrice('');
      setDiscount('');
      setSelectedMainCat('');
      setSelectedSubCat('');
      setSizes('');
      setDescription('');
      setSelectedImageFile(null);
      setImagePreviewUrl('');
      setFilteredSubCategories([]);

    } catch (err) {
      console.error(err);
      alert("⚠️ প্রোডাক্ট সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-8">
        
        {alert.show && (
          <div className="p-4 rounded-xl text-center font-bold text-sm bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            🛍️ নতুন প্রোডাক্ট যোগ করুন
          </h3>

          <form onSubmit={handleProductSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">🏷️ প্রোডাক্টের নাম</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                placeholder="যেমন: Premium Bangladesh Jersey 2026" 
                className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">💰 দাম (SAR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required 
                  placeholder="450" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">🏷️ ডিসকাউন্ট পার্সেন্ট (%)</label>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="যেমন: 50" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">📁 মেইন ক্যাটাগরি</label>
                <select 
                  value={selectedMainCat}
                  onChange={handleMainCatChange}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="" disabled>মেইন ক্যাটাগরি সিলেক্ট করুন</option>
                  {allMainCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">📂 সাব-ক্যাটাগরি</label>
                <select 
                  value={selectedSubCat}
                  onChange={(e) => setSelectedSubCat(e.target.value)}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="" disabled>{selectedMainCat ? "সাব-ক্যাটাগরি সিলেক্ট করুন" : "প্রথমে মেইন ক্যাটাগরি সিলেক্ট করুন"}</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">📏 সাইজ (কমা দিয়ে লিখুন)</label>
              <input 
                type="text" 
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L, XL, XXL" 
                className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">📝 প্রোডাক্ট বিবরণ</label>
              <textarea 
                rows="3" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="প্রোডাক্টের বিবরণ লিখুন..." 
                className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs text-black"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">🖼️ প্রোডাক্টের ছবি</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                required 
                className="w-full text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 border border-slate-300 rounded-xl bg-slate-50 cursor-pointer"
              />
              
              {imagePreviewUrl && (
                <div className="mt-3 text-center">
                  <img src={imagePreviewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-xl border shadow-sm mx-auto" />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs"
            >
              <span>{loading ? "⏳ আপলোড হচ্ছে..." : "🚀 প্রোডাক্ট সেভ ও পাবলিশ করুন"}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
