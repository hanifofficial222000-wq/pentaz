'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';

export default function ProductReturnPage() {
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [productId, setProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(true);

  // অ্যালার্ট মেসেজ দেখানোর ফাংশন
  const showAlertMessage = (msg) => {
    setAlert({ show: true, message: msg });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setAlert({ show: false, message: '' }), 4000);
    }
  };

  // লোকাল স্টোরেজ থেকে ফোন নম্বর লোড করা
  useEffect(() => {
    const savedPhone = localStorage.getItem("userPhone");
    if (savedPhone) {
      setCustomerPhone(savedPhone);
      loadMyReturns(savedPhone);
    } else {
      setLoadingReturns(false);
    }
  }, []);

  // ইমেজ ফাইল সিলেক্ট, প্রিভিউ এবং Base64 কনভার্ট হ্যান্ডলার
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ফাইল সাইজ ১ মেগাবাইটের নিচে রাখার পরামর্শ (ফায়ারবেস ডকুমেন্টের সাইজ লিমিট ঠিক রাখতে)
      if (file.size > 1048576) {
        alert("⚠️ ছবির সাইজ ১ এমবির কম দিন, অন্যথায় ফায়ারবেসে সেভ হতে সমস্যা হতে পারে।");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageFile(reader.result); // Base64 string
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview('');
    }
  };

  // রিটার্ন রিকোয়েস্ট লোড করার ফাংশন
  const loadMyReturns = useCallback(async (phone) => {
    const targetPhone = phone || customerPhone;
    if (!targetPhone) {
      setLoadingReturns(false);
      return;
    }

    setLoadingReturns(true);
    try {
      const q = query(collection(db, "returns"), where("customerPhone", "==", targetPhone));
      const snap = await getDocs(q);

      const items = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReturnsList(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReturns(false);
    }
  }, [customerPhone]);

  // নতুন রিটার্ন রিকোয়েস্ট সাবমিট হ্যান্ডলার (ফায়ারবেস ফায়ারস্টোরে সরাসরি সেভ)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile) {
      alert("দয়া করে পণ্যের একটি ছবি সিলেক্ট করুন!");
      return;
    }

    setSubmitting(true);

    try {
      const phoneVal = customerPhone.trim();

      await addDoc(collection(db, "returns"), {
        productId: productId.trim(),
        customerName: customerName.trim(),
        customerPhone: phoneVal,
        reason: returnReason.trim(),
        imageUrl: selectedImageFile, // Base64 ফরম্যাটে সরাসরি ফায়ারস্টোরে সেভ হচ্ছে
        status: "Pending",
        createdAt: serverTimestamp()
      });

      localStorage.setItem("userPhone", phoneVal);
      showAlertMessage("🎉 আপনার রিটার্ন রিকোয়েস্ট সফলভাবে জমা দেওয়া হয়েছে!");
      
      // ফর্ম রিসেট
      setProductId('');
      setReturnReason('');
      setSelectedImageFile(null);
      setImagePreview('');
      
      loadMyReturns(phoneVal);

    } catch (err) {
      console.error(err);
      alert("⚠️ রিকোয়েস্ট সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  // রিটার্ন রিকোয়েস্ট ডিলিট করার ফাংশন
  const deleteReturnRequest = async (docId) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই রিটার্ন রিকোয়েস্টটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "returns", docId));
        showAlertMessage("🗑️ রিটার্ন রিকোয়েস্ট সফলভাবে ডিলিট করা হয়েছে!");
        loadMyReturns();
      } catch (err) {
        console.error(err);
        alert("⚠️ ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">

      {/* Main Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-8">
        
        {/* Success Alert */}
        {alert.show && (
          <div className="p-4 rounded-xl text-center font-bold text-sm bg-green-100 text-green-700 border border-green-300">
            {alert.message}
          </div>
        )}

        {/* Header / Nav */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link href="/profile" className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg no-underline">
            ← ব্যাক
          </Link>
          <h2 className="text-lg font-bold text-slate-800">📦 পণ্য রিটার্ন রিকোয়েস্ট ফর্ম</h2>
          <button 
            onClick={() => loadMyReturns()} 
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer border-none"
          >
            রিফ্রেশ
          </button>
        </div>

        {/* SECTION 1: RETURN SUBMISSION FORM */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            🔄 নতুন রিটার্ন রিকোয়েস্ট সাবমিট করুন
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">প্রোডাক্ট আইডি / অর্ডার আইডি</label>
              <input 
                type="text" 
                value={productId} 
                onChange={(e) => setProductId(e.target.value)} 
                required 
                placeholder="অর্ডার আইডি বা প্রোডাক্ট পিন লিখুন..." 
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white text-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required 
                  placeholder="পূর্ণ নাম লিখুন..." 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল নম্বর</label>
                <input 
                  type="text" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  required 
                  placeholder="যে নম্বরে অর্ডার করেছেন..." 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">রিটার্ন করার কারণ</label>
              <textarea 
                value={returnReason} 
                onChange={(e) => setReturnReason(e.target.value)} 
                rows="2" 
                required 
                placeholder="কেন রিটার্ন করতে চান তা বিস্তারিত লিখুন..." 
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white text-black"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">পণ্যের ছবি আপলোড করুন</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required 
                className="w-full text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 border border-slate-300 rounded-xl bg-white cursor-pointer"
              />
              
              {imagePreview && (
                <div className="mt-3 text-center">
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border shadow-sm mx-auto" />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs disabled:opacity-50"
            >
              <span>{submitting ? "⏳ সাবমিট হচ্ছে..." : "🚀 রিটার্ন রিকোয়েস্ট পাঠান"}</span>
            </button>
          </form>
        </div>

        {/* SECTION 2: USER'S EXISTING RETURN REQUESTS */}
        <div>
          <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
            📋 আপনার সাবমিট করা রিটার্নসমূহ
          </h3>
          <div className="space-y-3">
            {loadingReturns ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                রিটার্ন ডাটা লোড হচ্ছে...
              </div>
            ) : returnsList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                এই নম্বরে কোনো রিটার্ন রিকোয়েস্ট পাওয়া যায়নি বা নম্বর দেওয়া হয়নি।
              </div>
            ) : (
              returnsList.map((item) => {
                const productImg = item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/60?text=No+Image';
                
                let statusBadge = <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase">Pending (অপেক্ষমান)</span>;
                if (item.status === 'Approved') {
                  statusBadge = <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase">Approved (অনুমোদিত)</span>;
                } else if (item.status === 'Cancelled') {
                  statusBadge = <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase">Cancelled (বাতিল)</span>;
                }

                return (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <a href={productImg} target="_blank" rel="noopener noreferrer" title="বড় করে দেখুন" className="shrink-0">
                      <img src={productImg} className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-sm" alt="Product" />
                    </a>
                    <div className="grow text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">আইডি: #{item.productId}</span>
                        <div className="flex items-center gap-2">
                          {statusBadge}
                          <button 
                            onClick={() => deleteReturnRequest(item.id)} 
                            title="ডিলিট করুন" 
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2 py-1 rounded-md text-xs transition cursor-pointer border-none"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 line-clamp-1">
                        <strong className="text-slate-700">কারণ:</strong> {item.reason}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
