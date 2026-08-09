'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function SpecialOfferManagePage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [prodTitle, setProdTitle] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodRegularPrice, setProdRegularPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [productImage, setProductImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '' });

  const cloudName = "b3gsgcpl";
  const uploadPreset = "tho4ycz8";

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // প্রোডাক্ট লোড করা (Products কালেকশন থেকে যেখানে isSpecialOffer: true বা category: special-offers)
  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isSpecialOffer || data.category?.toLowerCase() === 'special-offers') {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setProducts(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "specialOrders"));
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOrders(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (productImage) {
        const formData = new FormData();
        formData.append('file', productImage);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const cloudData = await res.json();
        if (cloudData.secure_url) {
          imageUrl = cloudData.secure_url;
        }
      }

      // 🟢 Fix: সরাসরি "products" কালেকশনে সেভ করা হলো যাতে হোম ও স্পেশাল পেজ উভয় জায়গায় শো করে
      await addDoc(collection(db, "products"), {
        title: prodTitle.trim(),
        discountPrice: prodDiscountPrice.trim(),
        regularPrice: prodRegularPrice.trim(),
        price: prodDiscountPrice.trim(),
        description: prodDesc.trim(),
        imageUrl: imageUrl,
        category: "special-offers",
        isSpecialOffer: true,
        approved: true,
        createdAt: serverTimestamp()
      });

      showAlert("🎉 স্পেশাল অফার প্রডাক্ট সফলভাবে অ্যাড হয়েছে!");
      setProdTitle('');
      setProdDiscountPrice('');
      setProdRegularPrice('');
      setProdDesc('');
      setProductImage(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("⚠️ প্রডাক্ট সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই স্পেশাল প্রডাক্টটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showAlert("🗑️ প্রডাক্ট সফলভাবে ডিলিট করা হয়েছে!");
        loadProducts();
      } catch (err) {
        console.error(err);
        alert("ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  const deleteOrder = async (id) => {
    if (confirm("আপনি কি এই অর্ডারটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "specialOrders", id));
        showAlert("🗑️ অর্ডার সফলভাবে ডিলিট করা হয়েছে!");
        loadOrders();
      } catch (err) {
        console.error(err);
        alert("ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-pink-600 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold uppercase">AYAAT SPORT SHOP - কন্ট্রোল রুম</h1>
          <p className="text-pink-200 text-xs mt-1">স্পেশাল অফার প্রডাক্ট ও অর্ডার ম্যানেজমেন্ট</p>
        </div>
        <Link href="/admin" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition no-underline">
          ⚙️ কন্ট্রোল রুম
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-8">
        {alert.show && (
          <div className="p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        <div className="bg-pink-50 p-5 rounded-xl border border-pink-200">
          <h3 className="text-base font-bold text-pink-900 mb-3">➕ নতুন স্পেশাল অফার প্রডাক্ট অ্যাড করুন</h3>
          <form onSubmit={handleAddProduct} className="space-y-4 bg-white p-4 rounded-xl border border-pink-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">প্রডাক্ট ছবি</label>
              <input 
                type="file" 
                accept="image/*" 
                required 
                onChange={(e) => setProductImage(e.target.files[0])} 
                className="w-full text-slate-500 text-xs border rounded-lg p-2 bg-slate-50 cursor-pointer" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">প্রডাক্ট শিরোনাম</label>
                <input 
                  type="text" 
                  required 
                  value={prodTitle} 
                  onChange={(e) => setProdTitle(e.target.value)} 
                  placeholder="যেমন: Special Edition Jersey" 
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500 text-black" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ডিসকাউন্ট মূল্য (টাকা)</label>
                <input 
                  type="number" 
                  required 
                  value={prodDiscountPrice} 
                  onChange={(e) => setProdDiscountPrice(e.target.value)} 
                  placeholder="যেমন: 599" 
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500 text-black" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">নিয়মিত মূল্য (টাকা)</label>
                <input 
                  type="number" 
                  required 
                  value={prodRegularPrice} 
                  onChange={(e) => setProdRegularPrice(e.target.value)} 
                  placeholder="যেমন: 1200" 
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500 text-black" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <input 
                  type="text" 
                  value={prodDesc} 
                  onChange={(e) => setProdDesc(e.target.value)} 
                  placeholder="প্রডাক্ট সম্পর্কে সংক্ষিপ্ত কিছু লিখুন" 
                  className="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500 text-black" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
            >
              {loading ? "আপলোড হচ্ছে..." : "🚀 প্রডাক্ট পাবলিশ করুন"}
            </button>
          </form>
        </div>

        <div className="bg-pink-50/50 p-5 rounded-xl border border-pink-100">
          <h3 className="text-base font-bold text-pink-900 mb-3">🛍️ প্রকাশিত স্পেশাল অফার প্রডাক্টসমূহ</h3>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-xs text-slate-400">কোনো প্রডাক্ট পাওয়া যায়নি।</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-xl border border-pink-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl || 'https://via.placeholder.com/60'} className="w-12 h-12 object-cover rounded-lg border" alt="" />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-slate-800">{p.title}</p>
                      <p className="text-pink-600 font-semibold">মূল্য: ৳{p.discountPrice || p.price} <span className="line-through text-slate-400 font-normal">৳{p.regularPrice}</span></p>
                    </div>
                  </div>
                  <button onClick={() => deleteProduct(p.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shrink-0">
                    প্রডাক্ট ডিলিট
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-3">📦 স্পেশাল অফার পেজের অর্ডারসমূহ</h3>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400">কোনো অর্ডার পাওয়া যায়নি।</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>🛒 <b>প্রডাক্ট:</b> {o.productName} (<span className="text-pink-600 font-bold">৳{o.productPrice}</span>)</p>
                    <p>👤 <b>গ্রাহক:</b> {o.customerName} | 📞 <b>ফোন:</b> {o.customerPhone}</p>
                    <p>📍 <b>ঠিকানা:</b> {o.customerAddress} | 📏 <b>সাইজ:</b> {o.customerSize}</p>
                  </div>
                  <button onClick={() => deleteOrder(o.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shrink-0">
                    ডিলিট অর্ডার
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
