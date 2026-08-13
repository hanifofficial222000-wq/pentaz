'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export default function BrandStorePage() {
  const { id } = useParams(); // সেলার আইডি
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrandData() {
      try {
        // সেলারের তথ্য আনা
        const sellerDoc = await getDoc(doc(db, "approved_sellers", id));
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data());
        }

        // ওই সেলারের আন্ডারে এপ্রুভড প্রোডাক্টগুলো গ্রিড আকারে আনা
        const q = query(collection(db, "products"), where("sellerId", "==", id));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setProducts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadBrandData();
  }, [id]);

  if (loading) return <div className="text-center py-10 text-xs">লোড হচ্ছে...</div>;

  return (
    <div className="bg-slate-100 min-h-screen pb-10 font-sans">
      {/* ব্র্যান্ড হেডার ব্যানার */}
      <div className="bg-gradient-to-r from-slate-900 to-red-600 p-6 text-white text-center space-y-2">
        <img src={seller?.profileUrl} className="w-20 h-20 rounded-full mx-auto border-4 border-white object-cover shadow-md" alt="Brand Logo" />
        <h1 className="text-lg font-extrabold">{seller?.brandName}</h1>
        <p className="text-xs text-red-200">পরিচালক: {seller?.firstName} {seller?.lastName}</p>
      </div>

      {/* প্রোডাক্ট গ্রিড সেকশন */}
      <div className="max-w-md mx-auto p-4">
        <h3 className="text-xs font-bold text-slate-700 mb-3">📦 এই ব্র্যান্ডের সমস্ত প্রোডাক্ট ({products.length})</h3>
        
        {products.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">এই মুহূর্তে এই ব্র্যান্ডের কোনো প্রোডাক্ট নেই।</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border shadow-sm flex flex-col justify-between">
                <img src={item.imageUrl} className="w-full h-32 object-cover rounded-lg mb-2" alt={item.title} />
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-red-600 font-extrabold mt-1">৳ {item.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
