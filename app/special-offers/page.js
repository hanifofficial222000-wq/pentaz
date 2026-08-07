'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  // ডামি স্পেশাল অফার প্রডাক্ট (ফায়ারবেস মুক্ত)
  useEffect(() => {
    const dummyOffers = [
      {
        id: 'special_1',
        title: 'অফিসিয়াল প্রিমিয়াম ফুটবল জার্সি (স্পেশাল এডিশন)',
        description: 'উন্নত মানের সুতি কাপড়ের তৈরি প্রিমিয়াম জার্সি। সীমিত সময়ের জন্য বিশেষ ছাড়ে উপলব্ধ।',
        regularPrice: '1200',
        discountPrice: '799',
        imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'special_2',
        title: 'প্রফেশনাল স্পোর্টস রানিং শু',
        description: 'হাঁটাহাঁটি এবং দৌড়ানোর জন্য অত্যন্ত আরামদায়ক ও টেকসই স্নিকার্স।',
        regularPrice: '2500',
        discountPrice: '1699',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
      }
    ];
    setProducts(dummyOffers);
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

  // অর্ডার সাবমিট হ্যান্ডলার (লোকালস্টোরেজে সেভ হবে)
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newOrder = {
        orderId: 'ORD_' + Math.floor(100000 + Math.random() * 900000),
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        productPrice: selectedProduct.discountPrice,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerSize: formData.size || 'N/A',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // লোকালস্টোরেজে অর্ডার সংরক্ষণ
      const existingOrders = JSON.parse(localStorage.getItem('ayaat_special_orders') || '[]');
      localStorage.setItem('ayaat_special_orders', JSON.stringify([newOrder, ...existingOrders]));

      alert("🎉 আপনার স্পেশাল অফার অর্ডারটি সফলভাবে সাবমিট হয়েছে!");
      setLoading(false);
      closeOrderModal();
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans text-slate-800">

      {/* Header */}
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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Banner / Notice */}
        <div className="bg-pink-100 border border-pink-300 p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <h2 className="text-pink-900 font-extrabold text-sm md:text-base">সীমিত সময়ের জন্য বিশেষ ছাড়!</h2>
          <p className="text-pink-700 text-xs">আপনার পছন্দের প্রডাক্টটি লুফে নিন এবং ঘরে বসেই অর্ডার করুন।</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="text-center col-span-full py-10 text-slate-400 text-xs">অফার প্রডাক্ট লোড হচ্ছে...</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                <div>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover" />}
                  <div className="p-4 space-y-2">
                    <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Special Offer</span>
                    <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-pink-600 font-extrabold text-sm">৳{p.discountPrice}</span>
                      <span className="text-slate-400 line-through text-xs">৳{p.regularPrice}</span>
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
            ))
          )}
        </div>

      </main>

      {/* Order Modal */}
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
              <b>মূল্য:</b> ৳{selectedProduct.discountPrice}
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
