'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export default function CategoryManagement() {
  const cloudName = "b3gsgcpl";
  const uploadPreset = "tho4ycz8";

  // State for Main Category
  const [mainCatName, setMainCatName] = useState('');
  const [mainCatImageFiles, setMainCatImageFiles] = useState([]);
  const [mainCatImagePreviews, setMainCatImagePreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // State for Sub Category
  const [parentMainCatSlug, setParentMainCatSlug] = useState('');
  const [subCatName, setSubCatName] = useState('');
  const [subCatImageFiles, setSubCatImageFiles] = useState([]);
  const [subCatImagePreviews, setSubCatImagePreviews] = useState([]);
  const [uploadingSubImage, setUploadingSubImage] = useState(false);

  // State for Child Sub Category (সাব-ক্যাটাগরির ভেতরে সাব-ক্যাটাগরি)
  const [selectedMainCatForChild, setSelectedMainCatForChild] = useState('');
  const [selectedSubCatForChild, setSelectedSubCatForChild] = useState('');
  const [childSubCatName, setChildSubCatName] = useState('');
  const [childSubImageFiles, setChildSubImageFiles] = useState([]);
  const [childSubImagePreviews, setChildSubImagePreviews] = useState([]);
  const [uploadingChildImage, setUploadingChildImage] = useState(false);
  
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allChildSubCategories, setAllChildSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState({ show: false, msg: '' });
  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  const createSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleMainImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setMainCatImageFiles(files);
    setMainCatImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSubCatImageFiles(files);
    setSubCatImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleChildSubImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setChildSubImageFiles(files);
    setChildSubImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const loadAllCategoriesData = async () => {
    try {
      const mainSnap = await getDocs(collection(db, "mainCategories"));
      setAllMainCategories(mainSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const subSnap = await getDocs(collection(db, "subCategories"));
      setAllSubCategories(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const childSnap = await getDocs(collection(db, "childSubCategories"));
      setAllChildSubCategories(childSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCategoriesData();
  }, []);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Image Upload Failed");
    return data.secure_url;
  };

  // ১. মেইন ক্যাটাগরি সাবমিট
  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();
    const name = mainCatName.trim();
    const slug = createSlug(name);
    
    if (!name || mainCatImageFiles.length === 0) {
      alert("দয়া করে নাম এবং ছবি দিন!");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadPromises = mainCatImageFiles.map(file => uploadToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);

      await addDoc(collection(db, "mainCategories"), { 
        name, 
        slug,
        icon: imageUrls[0],
        imageUrl: imageUrls[0], 
        imageUrls, 
        createdAt: serverTimestamp() 
      });

      showAlert("🎉 মেইন ক্যাটাগরি সফলভাবে সেভ হয়েছে!");
      setMainCatName('');
      setMainCatImageFiles([]);
      setMainCatImagePreviews([]);
      document.getElementById('mainCatImageInput').value = '';
      await loadAllCategoriesData();
    } catch (err) {
      console.error(err);
      alert("⚠️ মেইন ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setUploadingImage(false);
    }
  };

  // ২. সাব-ক্যাটাগরি সাবমিট
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    const mainCategorySlug = parentMainCatSlug;
    const name = subCatName.trim();
    const slug = createSlug(name);

    if (!mainCategorySlug || !name || subCatImageFiles.length === 0) {
      alert("দয়া করে সব ফিল্ড পূরণ করুন!");
      return;
    }

    setUploadingSubImage(true);
    try {
      const iconUrl = await uploadToCloudinary(subCatImageFiles[0]);

      await addDoc(collection(db, "subCategories"), { 
        mainCategorySlug, 
        mainCat: mainCategorySlug, 
        name, 
        slug,
        icon: iconUrl, 
        createdAt: serverTimestamp() 
      });

      showAlert("🎉 সাব-ক্যাটাগরি সফলভাবে সেভ হয়েছে!");
      setParentMainCatSlug('');
      setSubCatName('');
      setSubCatImageFiles([]);
      setSubCatImagePreviews([]);
      document.getElementById('subCatImageInput').value = '';
      await loadAllCategoriesData();
    } catch (err) {
      console.error(err);
      alert("⚠️ সাব-ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setUploadingSubImage(false);
    }
  };

  // ৩. সাব-ক্যাটাগরির ভেতরে সাব-ক্যাটাগরি (Child Sub-Category) সাবমিট
  const handleChildSubCategorySubmit = async (e) => {
    e.preventDefault();
    const name = childSubCatName.trim();
    const slug = createSlug(name);

    if (!selectedMainCatForChild || !selectedSubCatForChild || !name || childSubImageFiles.length === 0) {
      alert("দয়া করে মেইন ক্যাটাগরি, সাব-ক্যাটাগরি, নাম ও ছবি দিন!");
      return;
    }

    setUploadingChildImage(true);
    try {
      const iconUrl = await uploadToCloudinary(childSubImageFiles[0]);

      await addDoc(collection(db, "childSubCategories"), { 
        mainCategorySlug: selectedMainCatForChild,
        subCategorySlug: selectedSubCatForChild,
        name, 
        slug,
        icon: iconUrl, 
        createdAt: serverTimestamp() 
      });

      showAlert("🎉 চাইল্ড সাব-ক্যাটাগরি সফলভাবে সেভ হয়েছে!");
      setSelectedMainCatForChild('');
      setSelectedSubCatForChild('');
      setChildSubCatName('');
      setChildSubImageFiles([]);
      setChildSubImagePreviews([]);
      document.getElementById('childSubCatImageInput').value = '';
      await loadAllCategoriesData();
    } catch (err) {
      console.error(err);
      alert("⚠️ চাইল্ড সাব-ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setUploadingChildImage(false);
    }
  };

  const deleteDocItem = async (colName, id, name) => {
    if (confirm(` '${name}' ডিলিট করতে চান?`)) {
      try {
        await deleteDoc(doc(db, colName, id));
        showAlert("🗑️ সফলভাবে ডিলিট করা হয়েছে!");
        await loadAllCategoriesData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // সাব-ক্যাটাগরি ড্রপডাউন ফিল্টার (সিলেক্টেড মেইন ক্যাটাগরির আন্ডারে থাকা সাব-ক্যাটাগরিগুলো দেখানোর জন্য)
  const filteredSubCategoriesForChild = allSubCategories.filter(
    sub => sub.mainCategorySlug?.toLowerCase() === selectedMainCatForChild?.toLowerCase()
  );

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-8">
        
        {alert.show && (
          <div className="p-4 rounded-xl text-center font-bold text-sm bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        {/* ১. মেইন ক্যাটাগরি ফর্ম */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            📁 ১. মেইন ক্যাটাগরি যোগ করুন
          </h3>
          <form onSubmit={handleMainCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মেইন ক্যাটাগরির নাম</label>
              <input 
                type="text" 
                value={mainCatName}
                onChange={(e) => setMainCatName(e.target.value)}
                placeholder="যেমন: Fashion" 
                required 
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্যাটাগরির ছবি</label>
              <input 
                id="mainCatImageInput"
                type="file" 
                onChange={handleMainImageChange} 
                accept="image/*"
                multiple
                className="w-full border border-slate-300 p-2 rounded-lg bg-white text-xs"
              />
              {mainCatImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {mainCatImagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
                  ))}
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={uploadingImage}
              className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs hover:bg-slate-900 cursor-pointer"
            >
              {uploadingImage ? 'সেভ হচ্ছে...' : '➕ মেইন ক্যাটাগরি সেভ করুন'}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {allMainCategories.map((cat) => (
              <span key={cat.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border text-xs font-semibold text-slate-700 shadow-sm">
                {cat.icon && <img src={cat.icon} alt="" className="w-5 h-5 rounded-full object-cover" />}
                📁 {cat.name}
                <button type="button" onClick={() => deleteDocItem("mainCategories", cat.id, cat.name)} className="text-red-500 font-bold ml-1 cursor-pointer">✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* ২. সাব-ক্যাটাগরি ফর্ম */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            📂 ২. সাব-ক্যাটাগরি যোগ করুন
          </h3>
          <form onSubmit={handleSubCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">মেইন ক্যাটাগরি সিলেক্ট করুন</label>
                <select 
                  value={parentMainCatSlug}
                  onChange={(e) => setParentMainCatSlug(e.target.value)}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg bg-white text-xs text-black"
                >
                  <option value="" disabled>বেছে নিন</option>
                  {allMainCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">সাব-ক্যাটাগরির নাম</label>
                <input 
                  type="text" 
                  value={subCatName}
                  onChange={(e) => setSubCatName(e.target.value)}
                  placeholder="যেমন: Dress" 
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg text-xs text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">সাব-ক্যাটাগরি ছবি/আইকন</label>
              <input 
                id="subCatImageInput"
                type="file" 
                onChange={handleSubImageChange} 
                accept="image/*"
                required
                className="w-full border border-slate-300 p-2 rounded-lg bg-white text-xs"
              />
              {subCatImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {subCatImagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Sub Preview" className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={uploadingSubImage}
              className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs hover:bg-slate-900 cursor-pointer"
            >
              {uploadingSubImage ? 'সেভ হচ্ছে...' : '➕ সাব-ক্যাটাগরি সেভ করুন'}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {allSubCategories.map((sub) => (
              <span key={sub.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border text-xs font-semibold text-slate-700 shadow-sm">
                {sub.icon && <img src={sub.icon} alt="" className="w-5 h-5 rounded-full object-cover" />}
                📂 [{sub.mainCategorySlug}] → {sub.name}
                <button type="button" onClick={() => deleteDocItem("subCategories", sub.id, sub.name)} className="text-red-500 font-bold ml-1 cursor-pointer">✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* ৩. সাব-ক্যাটাগরির ভেতরে সাব-ক্যাটাগরি (Child Sub-Category) ফর্ম */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            📑 ৩. সাব-ক্যাটাগরির ভেতরে সাব-ক্যাটাগরি যোগ করুন
          </h3>
          <form onSubmit={handleChildSubCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">মেইন ক্যাটাগরি সিলেক্ট করুন</label>
                <select 
                  value={selectedMainCatForChild}
                  onChange={(e) => {
                    setSelectedMainCatForChild(e.target.value);
                    setSelectedSubCatForChild(''); // রিসেট
                  }}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg bg-white text-xs text-black"
                >
                  <option value="" disabled>মেইন ক্যাটাগরি বেছে নিন</option>
                  {allMainCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">সাব-ক্যাটাগরি সিলেক্ট করুন</label>
                <select 
                  value={selectedSubCatForChild}
                  onChange={(e) => setSelectedSubCatForChild(e.target.value)}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg bg-white text-xs text-black"
                >
                  <option value="" disabled>আগে মেইন ক্যাটাগরি সিলেক্ট করুন</option>
                  {filteredSubCategoriesForChild.map((sub) => (
                    <option key={sub.id} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">চাইল্ড সাব-ক্যাটাগরির নাম</label>
              <input 
                type="text" 
                value={childSubCatName}
                onChange={(e) => setChildSubCatName(e.target.value)}
                placeholder="যেমন: Party Dress / Casual Dress" 
                required 
                className="w-full border border-slate-300 p-3 rounded-lg text-xs text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ছবি/আইকন</label>
              <input 
                id="childSubCatImageInput"
                type="file" 
                onChange={handleChildSubImageChange} 
                accept="image/*"
                required
                className="w-full border border-slate-300 p-2 rounded-lg bg-white text-xs"
              />
              {childSubImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {childSubImagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Child Preview" className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={uploadingChildImage}
              className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs hover:bg-slate-900 cursor-pointer"
            >
              {uploadingChildImage ? 'সেভ হচ্ছে...' : '➕ চাইল্ড সাব-ক্যাটাগরি সেভ করুন'}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {allChildSubCategories.map((child) => (
              <span key={child.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border text-xs font-semibold text-slate-700 shadow-sm">
                {child.icon && <img src={child.icon} alt="" className="w-5 h-5 rounded-full object-cover" />}
                📑 [{child.subCategorySlug}] → {child.name}
                <button type="button" onClick={() => deleteDocItem("childSubCategories", child.id, child.name)} className="text-red-500 font-bold ml-1 cursor-pointer">✕</button>
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
