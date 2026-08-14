'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProductManagement() {
  const [allMainCategories, setAllMainCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allChildSubCategories, setAllChildSubCategories] = useState([]);
  
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredChildSubCategories, setFilteredChildSubCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedChildSubCat, setSelectedChildSubCat] = useState('');
  
  const [sizes, setSizes] = useState('');
  const [description, setDescription] = useState('');
  
  // ⚡ ফ্ল্যাশ সেল ও অফার সম্পর্কিত স্টেট
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState('');

  // 🏷️ ট্যাব ফিল্টার সম্পর্কিত স্টেট (Best Seller, Discount Offer, Promo)
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isDiscountOffer, setIsDiscountOffer] = useState(false);
  const [isPromoProduct, setIsPromoProduct] = useState(false);

  // Multiple Product Images State
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);

  // Color Variants State [{name: '', file: null, preview: ''}]
  const [colors, setColors] = useState([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorFile, setNewColorFile] = useState(null);
  const [newColorPreview, setNewColorPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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
        setAllMainCategories(mainSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const subSnap = await getDocs(collection(db, "subCategories"));
        setAllSubCategories(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const childSnap = await getDocs(collection(db, "childSubCategories"));
        setAllChildSubCategories(childSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleMainCatChange = (e) => {
    const mainSlug = e.target.value;
    setSelectedMainCat(mainSlug);
    setSelectedSubCat('');
    setSelectedChildSubCat('');
    
    // ফিল্টার সাব-ক্যাটাগরি
    const filteredSubs = allSubCategories.filter(
      s => (s.mainCategorySlug || s.mainCat)?.toLowerCase() === mainSlug.toLowerCase()
    );
    setFilteredSubCategories(filteredSubs);
    setFilteredChildSubCategories([]);
  };

  const handleSubCatChange = (e) => {
    const subSlug = e.target.value;
    setSelectedSubCat(subSlug);
    setSelectedChildSubCat('');

    // ফিল্টার চাইল্ড সাব-ক্যাটাগরি
    const filteredChildren = allChildSubCategories.filter(
      c => c.subCategorySlug?.toLowerCase() === subSlug.toLowerCase()
    );
    setFilteredChildSubCategories(filteredChildren);
  };

  // Handle Multiple Product Images Selection
  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setProductImageFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setProductImagePreviews(previews);
    }
  };

  // Handle New Color Image Selection
  const handleNewColorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewColorFile(file);
      setNewColorPreview(URL.createObjectURL(file));
    }
  };

  // Add Color Variant to List
  const handleAddColorVariant = () => {
    if (!newColorName.trim() || !newColorFile) {
      alert("দয়া করে কালারের নাম এবং ছবি দিন!");
      return;
    }
    setColors([...colors, { name: newColorName.trim(), file: newColorFile, preview: newColorPreview }]);
    setNewColorName('');
    setNewColorFile(null);
    setNewColorPreview('');
  };

  // Remove Color Variant
  const handleRemoveColor = (index) => {
    const updated = colors.filter((_, i) => i !== index);
    setColors(updated);
  };

  // Firebase Storage Upload Helper
  const uploadToFirebaseStorage = async (file, folderName) => {
    const fileRef = ref(storage, `${folderName}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (productImageFiles.length === 0) {
      alert("দয়া করে কমপক্ষে একটি প্রোডাক্টের ছবি সিলেক্ট করুন!");
      return;
    }

    setLoading(true);

    try {
      setUploadProgress("প্রোডাক্টের ছবি আপলোড হচ্ছে...");
      let imageUrls = [];
      for (let file of productImageFiles) {
        const url = await uploadToFirebaseStorage(file, 'product_images');
        imageUrls.push(url);
      }

      setUploadProgress("কালার ভ্যারিয়েন্ট ছবি আপলোড হচ্ছে...");
      let colorVariants = [];
      for (let col of colors) {
        const colUrl = await uploadToFirebaseStorage(col.file, 'color_variant_images');
        colorVariants.push({ name: col.name, imageUrl: colUrl });
      }

      const sizesArray = sizes ? sizes.split(',').map(s => s.trim()).filter(s => s !== '') : [];

      let formattedEndsAt = null;
      if (isFlashSale && flashSaleEndsAt) {
        formattedEndsAt = new Date(flashSaleEndsAt);
      }

      await addDoc(collection(db, "products"), {
        title: title.trim(),
        price: Number(price),
        discount: discount ? Number(discount) : null,
        mainCategory: selectedMainCat,
        mainCategorySlug: selectedMainCat,
        subCategory: selectedSubCat,
        subCategorySlug: selectedSubCat,
        category: selectedSubCat,
        childSubCategory: selectedChildSubCat || null,
        childSubCategorySlug: selectedChildSubCat || null,
        sizes: sizesArray,
        description: description.trim(),
        imageUrls: imageUrls,
        imageUrl: imageUrls[0], // Main fallback image
        colorVariants: colorVariants,
        isFlashSale: isFlashSale,
        isSpecialOffer: isFlashSale,
        flashSaleEndsAt: formattedEndsAt,
        bestseller: isBestSeller,
        isBestSeller: isBestSeller,
        isDiscountOffer: isDiscountOffer,
        isPromoProduct: isPromoProduct,
        coupon: isPromoProduct ? "ACTIVE" : null,
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
      setSelectedChildSubCat('');
      setSizes('');
      setDescription('');
      setIsFlashSale(false);
      setFlashSaleEndsAt('');
      setIsBestSeller(false);
      setIsDiscountOffer(false);
      setIsPromoProduct(false);
      setProductImageFiles([]);
      setProductImagePreviews([]);
      setColors([]);
      setFilteredSubCategories([]);
      setFilteredChildSubCategories([]);

    } catch (err) {
      console.error(err);
      alert("⚠️ প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
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
            🛍️ নতুন প্রোডাক্ট যোগ করুন (নতুন ক্যাটাগরি সিস্টেম)
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

            {/* ⚡ ফ্ল্যাশ সেল ও অফার সেটিং সেকশন */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="flashSaleCheck"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="flashSaleCheck" className="text-sm font-bold text-amber-900 cursor-pointer">
                  ⚡ এটি কি ফ্ল্যাশ সেল বা স্পেশাল অফার প্রোডাক্ট হবে?
                </label>
              </div>

              {isFlashSale && (
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">⏰ অফার শেষের তারিখ ও সময় (End Time)</label>
                  <input 
                    type="datetime-local" 
                    value={flashSaleEndsAt}
                    onChange={(e) => setFlashSaleEndsAt(e.target.value)}
                    required={isFlashSale}
                    className="w-full border border-amber-300 p-2.5 rounded-xl bg-white text-xs text-black outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* 🔗 হোমপেজ ট্যাব লিংক সেকশন */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3">
              <label className="block text-sm font-bold text-red-900">📌 হোমপেজ ট্যাব লিংক সেকশন</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-red-100">
                  <input 
                    type="checkbox" 
                    id="bestSellerCheck"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="bestSellerCheck" className="text-xs font-bold text-slate-700 cursor-pointer">🔥 Best Seller</label>
                </div>

                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-red-100">
                  <input 
                    type="checkbox" 
                    id="discountOfferCheck"
                    checked={isDiscountOffer}
                    onChange={(e) => setIsDiscountOffer(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="discountOfferCheck" className="text-xs font-bold text-slate-700 cursor-pointer">🏷️ Discount Offer</label>
                </div>

                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-red-100">
                  <input 
                    type="checkbox" 
                    id="promoCheck"
                    checked={isPromoProduct}
                    onChange={(e) => setIsPromoProduct(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="promoCheck" className="text-xs font-bold text-slate-700 cursor-pointer">🎟️ Promo</label>
                </div>
              </div>
            </div>

            {/* ক্যাটাগরি সিলেকশন সেকশন (মেইন, সাব এবং চাইল্ড সাব) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">📁 মেইন ক্যাটাগরি</label>
                <select 
                  value={selectedMainCat}
                  onChange={handleMainCatChange}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="" disabled>সিলেক্ট করুন</option>
                  {allMainCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">📂 সাব-ক্যাটাগরি</label>
                <select 
                  value={selectedSubCat}
                  onChange={handleSubCatChange}
                  required 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="" disabled>{selectedMainCat ? "সিলেক্ট করুন" : "আগে মেইন দিন"}</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.slug || sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">📑 চাইল্ড সাব (ঐচ্ছিক)</label>
                <select 
                  value={selectedChildSubCat}
                  onChange={(e) => setSelectedChildSubCat(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs text-black"
                >
                  <option value="">প্রযোজ্য নয়</option>
                  {filteredChildSubCategories.map((child) => (
                    <option key={child.id} value={child.slug || child.name}>{child.name}</option>
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

            {/* Multiple Product Images */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">🖼️ প্রোডাক্টের একাধিক ছবি</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleProductImagesChange}
                required 
                className="w-full text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 border border-slate-300 rounded-xl bg-slate-50 cursor-pointer"
              />
              
              {productImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {productImagePreviews.map((url, idx) => (
                    <img key={idx} src={url} alt="Preview" className="h-20 w-20 object-cover rounded-xl border shadow-sm flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>

            {/* Color Variants Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-sm font-bold text-slate-800">🎨 কালার ভ্যারিয়েন্ট ও ছবি (ঐচ্ছিক)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text" 
                  value={newColorName} 
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="কালারের নাম (যেমন: Red)" 
                  className="border border-slate-300 p-2.5 rounded-xl text-xs bg-white text-black"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleNewColorImageChange}
                  className="border border-slate-300 p-1.5 rounded-xl text-xs bg-white"
                />
                <button 
                  type="button" 
                  onClick={handleAddColorVariant}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold p-2.5 rounded-xl text-xs cursor-pointer"
                >
                  + কালার যোগ করুন
                </button>
              </div>

              {newColorPreview && (
                <div className="flex items-center gap-2 mt-2">
                  <img src={newColorPreview} alt="Color Preview" className="w-12 h-12 object-cover rounded-lg border" />
                  <span className="text-xs text-slate-600">সিলেক্টেড কালার প্রিভিউ</span>
                </div>
              )}

              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
                  {colors.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border p-2 rounded-xl shadow-xs">
                      <img src={col.preview} alt={col.name} className="w-8 h-8 object-cover rounded-md" />
                      <span className="text-xs font-bold text-slate-700">{col.name}</span>
                      <button type="button" onClick={() => handleRemoveColor(idx)} className="text-red-500 font-bold text-xs ml-2 cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs"
            >
              <span>{loading ? (uploadProgress || "⏳ আপলোড হচ্ছে...") : "🚀 প্রোডাক্ট সেভ ও পাবলিশ করুন"}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
