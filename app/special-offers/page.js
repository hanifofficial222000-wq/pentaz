'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function SpecialOffersPage() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    size: ''
  });
  const [loading, setLoading] = useState(false);

  // ফায়ারবেস থেকে স্পেশাল অফার প্রডাক্ট লোড করা (Products কালেকশন থেকে ফিল্টার করে)
  const fetchProducts = async () => {
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
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // অর্ডার মডাল ওপেন করা
  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // অর্ডার মডাল বন্ধ করা
  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({ name: '', phone: '', address: '', size: '' });
  };

  // ফর্ম ইনপুট হ্যান্ডলার
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // অর্ডার সাবমিট হ্যান্ডলার (specialOrders কালেকশনে সেভ হবে)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newOrder = {
        orderId: 'ORD_' + Math.floor(100000 + Math.random() * 900000),
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        productPrice: selectedProduct.discountPrice || selectedProduct.price,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerSize: formData.size || 'N/A',
        status: 'Pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "specialOrders"), newOrder);

      alert("🎉 আপনার স্পেশাল অফার অর্ডারটি সফলভাবে সাবমিট হয়েছে!");
      setLoading(false);
      closeOrderModal();
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("⚠️ অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans text-slate-800">
      <header className="bg-gradient-to-r from-pink-600 to-slate-900 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-xs font-bold transition no-underline text-white">
              ← হোম
            </Link>
            <h1 className="text-base md:text-lg font-extrabold uppercase tracking-wide">🔥 স্পেশাল ডিসকাউন্ট অফার</h1>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">AYAAT SPORT SHOP</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-pink-100 border border-pink-300 p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <h2 className="text-pink-900 font-extrabold text-sm md:text-base">সীমিত সময়ের জন্য বিশেষ ছাড়!</h2>
          <p className="text-pink-700 text-xs">আপনার পছন্দের প্রডাক্টটি লুফে নিন এবং ঘরে বসেই অর্ডার করুন।</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="text-center col-span-full py-10 text-slate-400 text-xs">কোনো অফার প্রডাক্ট পাওয়া যায়নি।</div>
          ) : (
            products.map((p) => {
              const mainImg = p.imageUrl || p.image || (p.imageUrls && p.imageUrls[0]) || 'https://via.placeholder.com/300';
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                  <div>
                    <img src={mainImg} alt={p.title} className="w-full h-48 object-cover" />
                    <div className="p-4 space-y-2">
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Special Offer</span>
                      <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-pink-600 font-extrabold text-sm">৳{p.discountPrice || p.price}</span>
                        {p.regularPrice && <span className="text-slate-400 line-through text-xs">৳{p.regularPrice}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button 
                      onClick={() => openOrderModal(p)} 
                      className="w-full bg-slate-900 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                    >
                      অর্ডার করুন
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={closeOrderModal} 
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            
            <h3 className="text-base font-bold text-slate-800">অর্ডার কনফার্ম করুন</h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border">
              <b>প্রডাক্ট:</b> {selectedProduct.title}<br />
              <b>মূল্য:</b> ৳{selectedProduct.discountPrice || selectedProduct.price}
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="পূর্ণ নাম লিখুন" 
                  className="w-full border p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল নম্বর</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  placeholder="017xxxxxxxx" 
                  className="w-full border p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ডেলিভারি ঠিকানা</label>
                <textarea 
                  name="address"
                  rows="2" 
                  value={formData.address}
                  onChange={handleChange}
                  required 
                  placeholder="বাসা, রোড, থানা, জেলা" 
                  className="w-full border p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none text-black bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">সাইজ (যদি থাকে)</label>
                <input 
                  type="text" 
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="যেমন: M / L / XL বা 42" 
                  className="w-full border p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none text-black bg-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                {loading ? "অর্ডার সাবমিট হচ্ছে..." : "🛒 অর্ডার কনফার্ম করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
