'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; // storage ইমপোর্ট করা হলো
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // ফায়ারবেস স্টোরেজের ফাংশন

export default function CategoryManagement() {
  const [mainCatName, setMainCatName] = useState('');
  const [mainCatImageFile, setMainCatImageFile] = useState(null); // ফাইলের জন্য স্টেট
  const [mainCatImagePreview, setMainCatImagePreview] = useState(''); // প্রিভিউয়ের জন্য স্টেট
  const [uploadingImage, setUploadingImage] = useState(false);

  const [parentMainCatSelect, setParentMainCatSelect] = useState('');
  const [subCatName, setSubCatName] = useState('');
  
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState({ show: false, msg: '' });
  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // লোকাল ফাইল সিলেক্ট এবং প্রিভিউ দেখানোর জন্য
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainCatImageFile(file);
    setMainCatImagePreview(URL.createObjectURL(file));
  };

  const loadAllCategoriesData = async () => {
    try {
      const mainSnap = await getDocs(collection(db, "mainCategories"));
      const mainList = mainSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllMainCategories(mainList);

      const subSnap = await getDocs(collection(db, "subCategories"));
      const subList = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllSubCategories(subList);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCategoriesData();
  }, []);

  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();
    const name = mainCatName.trim();
    
    if (!name) {
      alert("দয়া করে মেইন ক্যাটাগরির নাম দিন!");
      return;
    }
    if (!mainCatImageFile) {
      alert("দয়া করে ক্যাটাগরির একটি ছবি সিলেক্ট করুন!");
      return;
    }

    setUploadingImage(true);

    try {
      // ছবি সরাসরি ফায়ারবেস স্টোরেজে আপলোড করা হচ্ছে
      const imageRef = ref(storage, `category_images/${Date.now()}_${mainCatImageFile.name}`);
      const snapshot = await uploadBytes(imageRef, mainCatImageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // ফায়ারস্টোর ডেটাবেজে নাম এবং ছবির লিংক সেভ করা হচ্ছে
      await addDoc(collection(db, "mainCategories"), { 
        name, 
        imageUrl, 
        createdAt: serverTimestamp() 
      });

      showAlert("🎉 মেইন ক্যাটাগরি সফলভাবে সেভ হয়েছে!");
      setMainCatName('');
      setMainCatImageFile(null);
      setMainCatImagePreview('');
      
      const fileInput = document.getElementById('mainCatImageInput');
      if (fileInput) fileInput.value = '';
      
      await loadAllCategoriesData();
    } catch (err) {
      console.error("Save error:", err);
      alert("⚠️ ডেটাবেজে সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    const mainCat = parentMainCatSelect;
    const name = subCatName.trim();
    if (!mainCat || !name) return;

    try {
      await addDoc(collection(db, "subCategories"), { mainCat, name, createdAt: serverTimestamp() });
      showAlert("🎉 সাব-ক্যাটাগরি সফলভাবে সেভ হয়েছে!");
      setParentMainCatSelect('');
      setSubCatName('');
      await loadAllCategoriesData();
    } catch (err) {
      console.error(err);
      alert("⚠️ সেভ করতে সমস্যা হয়েছে!");
    }
  };

  const deleteMainCat = async (id, name) => {
    if (confirm(`মেইন ক্যাটাগরি '${name}' ডিলিট করতে চান?`)) {
      try {
        await deleteDoc(doc(db, "mainCategories", id));
        showAlert("🗑️ মেইন ক্যাটাগরি ডিলিট করা হয়েছে!");
        await loadAllCategoriesData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteSubCat = async (id, name) => {
    if (confirm(`সাব-ক্যাটাগরি '${name}' ডিলিট করতে চান?`)) {
      try {
        await deleteDoc(doc(db, "subCategories", id));
        showAlert("🗑️ সাব-ক্যাটাগরি ডিলিট করা হয়েছে!");
        await loadAllCategoriesData();
      } catch (err) {
        console.error(err);
      }
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

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            📁 ১. মেইন ক্যাটাগরি যোগ করুন (গোল ছবিসহ)
          </h3>
          <form onSubmit={handleMainCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মেইন ক্যাটাগরির নাম</label>
              <input 
                type="text" 
                value={mainCatName}
                onChange={(e) => setMainCatName(e.target.value)}
                placeholder="যেমন: Women" 
                required 
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্যাটাগরি গোল ছবি (Image)</label>
              <input 
                id="mainCatImageInput"
                type="file" 
                onChange={handleImageChange} 
                accept="image/*"
                className="w-full border border-slate-300 p-2 rounded-lg bg-white text-xs"
              />
              {mainCatImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={mainCatImagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                  <span className="text-xs text-green-600 font-bold">ছবি সিলেক্ট করা হয়েছে!</span>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={uploadingImage}
              className={`w-full text-white font-semibold py-2.5 rounded-lg transition duration-200 text-xs ${uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 cursor-pointer'}`}
            >
              {uploadingImage ? 'ছবি আপলোড ও সেভ হচ্ছে, অপেক্ষা করুন...' : '➕ মেইন ক্যাটাগরি সেভ করুন'}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">বর্তমান মেইন ক্যাটাগরি সমূহ:</p>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-xs text-slate-400">লোড হচ্ছে...</span>
              ) : allMainCategories.length === 0 ? (
                <span className="text-xs text-slate-400">কোনো মেইন ক্যাটাগরি নেই</span>
              ) : (
                allMainCategories.map((cat) => (
                  <span key={cat.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    {cat.imageUrl && <img src={cat.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    📁 {cat.name}
                    <button type="button" onClick={() => deleteMainCat(cat.id, cat.name)} className="text-red-500 font-bold ml-1 cursor-pointer">✕</button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            📂 ২. সাব-ক্যাটাগরি যোগ করুন
          </h3>
          <form onSubmit={handleSubCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">মেইন ক্যাটাগরি সিলেক্ট করুন</label>
                <select 
                  value={parentMainCatSelect}
                  onChange={(e) => setParentMainCatSelect(e.target.value)}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="" disabled>মেইন ক্যাটাগরি বেছে নিন</option>
                  {allMainCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">সাব-ক্যাটাগরির নাম</label>
                <input 
                  type="text" 
                  value={subCatName}
                  onChange={(e) => setSubCatName(e.target.value)}
                  placeholder="যেমন: Jersey" 
                  required 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-black"
                />
              </div>
            </div>
            <button type="submit" 
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition duration-200 cursor-pointer text-xs">
              ➕ সাব-ক্যাটাগরি সেভ করুন
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">বর্তমান সাব-ক্যাটাগরি সমূহ:</p>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-xs text-slate-400">লোড হচ্ছে...</span>
              ) : allSubCategories.length === 0 ? (
                <span className="text-xs text-slate-400">কোনো সাব-ক্যাটাগরি নেই</span>
              ) : (
                allSubCategories.map((sub) => (
                  <span key={sub.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    📂 [{sub.mainCat}] → {sub.name}
                    <button type="button" onClick={() => deleteSubCat(sub.id, sub.name)} className="text-red-500 font-bold ml-1 cursor-pointer">✕</button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
