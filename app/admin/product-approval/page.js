'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPendingProductsPage() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pending_products"));
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setPendingProducts(list);
    } catch (err) {
      console.error("Error fetching pending products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  // প্রোডাক্ট এপ্রুভ করার ফাংশন
  const handleApproveProduct = async (product) => {
    if (!confirm(`"${product.title}" প্রোডাক্টটি এপ্রুভ করে লাইভ করতে চান?`)) return;

    try {
      // ১. মূল 'products' কালেকশনে সেভ করা
      await setDoc(doc(db, "products", product.id), {
        ...product,
        approved: true,
        approvedAt: new Date()
      });

      // ২. 'pending_products' থেকে রিমুভ করা
      await deleteDoc(doc(db, "pending_products", product.id));

      alert("🎉 প্রোডাক্টটি সফলভাবে এপ্রুভ ও লাইভ করা হয়েছে!");
      fetchPendingProducts();
    } catch (err) {
      console.error("Product Approval Error:", err);
      alert("প্রোডাক্ট এপ্রুভ করতে সমস্যা হয়েছে।");
    }
  };

  // প্রোডাক্ট ডিলিট বা রিজেক্ট করার ফাংশন
  const handleDeleteProduct = async (id) => {
    if (!confirm("প্রোডাক্টটি কি ডিলিট করতে চান?")) return;

    try {
      await deleteDoc(doc(db, "pending_products", id));
      alert("❌ প্রোডাক্টটি মুছে ফেলা হয়েছে।");
      fetchPendingProducts();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  if (loading) return <div className="text-center py-10 text-xs font-bold">লোড হচ্ছে...</div>;

  return (
    <div className="bg-slate-100 min-h-screen p-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-base font-extrabold text-slate-800 mb-4 pb-2 border-b">
          📦 সেলার প্রোডাক্ট এপ্রুভাল প্যানেল ({pendingProducts.length})
        </h2>

        {pendingProducts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">এপ্রুভ করার মতো কোনো পেন্ডিং প্রোডাক্ট নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProducts.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between shadow-sm">
                
                <div className="flex gap-3">
                  <img src={item.imageUrl} alt={item.title} className="w-24 h-24 object-cover rounded-lg border flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-red-600 font-extrabold">মূল্য: {item.price}</p>
                    <p className="text-slate-600"><b>ক্যাটাগরি:</b> {item.category}</p>
                    <p className="text-slate-600"><b>সেলার ফোন:</b> {item.sellerPhone || 'N/A'}</p>
                    <p className="text-slate-500 line-clamp-2"><b>বিবরণ:</b> {item.description || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-2 border-t">
                  <button 
                    onClick={() => handleApproveProduct(item)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer transition"
                  >
                    ✅ Approve & Live
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(item.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer transition"
                  >
                    ❌ Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
