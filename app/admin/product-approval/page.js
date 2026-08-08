'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function ProductApproval() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Pending Products
  const loadPendingProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pending_products"));
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setPendingProducts(list);
    } catch (err) {
      console.error("Error loading pending products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingProducts();
  }, []);

  // Approve Product
  const approveProduct = async (docId) => {
    if (!confirm("আপনি কি এই প্রোডাক্টটি অ্যাপ্রুভ করে মূল সাইটে প্রকাশ করতে চান?")) return;

    try {
      const docRef = doc(db, "pending_products", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let productData = docSnap.data();
        productData.approved = true;

        await setDoc(doc(db, "products", docId), productData);
        await deleteDoc(docRef);

        alert("প্রোডাক্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে!");
        loadPendingProducts();
      } else {
        alert("প্রোডাক্টটি খুঁজে পাওয়া যায়নি!");
      }
    } catch (err) {
      console.error("Error approving product:", err);
      alert("অ্যাপ্রুভ করতে সমস্যা হয়েছে!");
    }
  };

  // Reject Product
  const rejectProduct = async (docId) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট বা বাতিল করতে চান?")) return;

    try {
      await deleteDoc(doc(db, "pending_products", docId));
      alert("প্রোডাক্টটি বাতিল করা হয়েছে!");
      loadPendingProducts();
    } catch (err) {
      console.error("Error rejecting product:", err);
      alert("বাতিল করতে সমস্যা হয়েছে!");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans pb-12">
      <div className="max-w-[700px] mx-auto my-5 p-4">
        
        {/* Back Link */}
        <Link href="/admin/control-room" className="inline-block mb-4 text-[#e63946] no-underline font-bold text-[13px] hover:underline">
          ← কন্ট্রোল রুমে ফিরে যান
        </Link>
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-5 text-center">
          <h2 className="text-[#e63946] text-xl font-bold mb-1">⏳ প্রোডাক্ট অ্যাপ্রুভাল প্যানেল</h2>
          <p className="text-[13px] text-slate-500">ইউজারদের সাবমিট করা নতুন প্রোডাক্টগুলো যাচাই করে অনুমোদন বা বাতিল করুন।</p>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center p-8 text-slate-500 font-bold text-xs">প্রোডাক্ট লোড হচ্ছে...</div>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center p-8 text-slate-500 font-bold text-xs bg-white rounded-xl shadow-sm">কোনো নতুন পেন্ডিং প্রোডাক্ট নেই!</div>
          ) : (
            pendingProducts.map((item) => {
              let imgUrl = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : (item.imageUrl || 'https://via.placeholder.com/100');
              
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4 items-center border border-slate-200">
                  <img src={imgUrl} className="w-20 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0" alt={item.title || 'Product'} />
                  
                  <div className="flex-grow text-xs space-y-1">
                    <h4 className="text-[15px] font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-600">মূল্য: <span className="text-[#e63946] font-bold">SAR {item.price}</span></p>
                    <p className="text-slate-600">ক্যাটাগরি: {item.category || 'N/A'}</p>
                    <p className="text-slate-600">বিক্রেতা: {item.sellerName || 'N/A'} {item.sellerPhone ? `(${item.sellerPhone})` : ''}</p>
                    
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => approveProduct(item.id)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer"
                      >
                        অ্যাপ্রুভ করুন
                      </button>
                      <button 
                        onClick={() => rejectProduct(item.id)} 
                        className="bg-rose-500 hover:bg-rose-600 text-white border-none px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer"
                      >
                        বাতিল করুন
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
