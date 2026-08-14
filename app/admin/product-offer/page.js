'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';

export default function ProductOfferManagement() {
  const [allProductsList, setAllProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Products from Firestore
  const loadAdminProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setAllProductsList(list);
      setFilteredProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProducts();
  }, []);

  // Search Filter
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(allProductsList);
    } else {
      const filtered = allProductsList.filter(item => {
        let title = item.title ? item.title.toLowerCase() : '';
        let id = item.id.toLowerCase();
        let mainCat = item.mainCategorySlug || item.mainCategory || '';
        let subCat = item.subCategorySlug || item.subCategory || '';
        let productPin = item.productPin ? item.productPin.toLowerCase() : item.id.slice(0, 6).toLowerCase();
        
        return title.includes(query) || id.includes(query) || productPin.includes(query) || mainCat.toLowerCase().includes(query) || subCat.toLowerCase().includes(query);
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allProductsList]);

  // Update Product Discount
  const updateProductDiscount = async (productId) => {
    const inputElement = document.getElementById(`discount_${productId}`);
    const inputVal = inputElement ? inputElement.value : "";
    const discountNum = Number(inputVal);

    if (inputVal === "" || discountNum < 0) {
      alert("দয়া করে সঠিক ডিসকাউন্ট পার্সেন্টেজ লিখুন!");
      return;
    }

    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        discount: discountNum
      });
      alert("সফলভাবে অফার আপডেট করা হয়েছে!");
      loadAdminProducts();
    } catch (err) {
      console.error("Error updating discount:", err);
      alert("অফার আপডেট করতে সমস্যা হয়েছে!");
    }
  };

  // Remove Product Discount
  const removeProductDiscount = async (productId) => {
    if (!confirm("আপনি কি এই প্রোডাক্টের অফার বা ছাড়টি রিমুভ করতে চান?")) return;

    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        discount: deleteField()
      });
      alert("অফার সফলভাবে মুছে ফেলা হয়েছে!");
      loadAdminProducts();
    } catch (err) {
      console.error("Error removing discount:", err);
      alert("অফার মুছতে সমস্যা হয়েছে!");
    }
  };

  // Delete Product Item
  const deleteProductItem = async (productId) => {
    if (!confirm("সতর্কতা! আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি চিরতরে ডিলিট করতে চান?")) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      alert("প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে!");
      loadAdminProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে!");
    }
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-6 px-4 md:px-8 pb-[50px] font-sans">
      <div className="max-w-[700px] mx-auto my-5">
        
        {/* Back Link */}
        <Link href="/" className="inline-block mb-4 text-[#e63946] no-underline font-bold text-[13px] hover:underline">
          ← হোম পেজে ফিরে যান
        </Link>
        
        {/* Header */}
        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5 text-center">
          <h2 className="text-[#e63946] text-xl font-bold mb-1">🏷️ প্রোডাক্ট অফার ও ম্যানেজমেন্ট (নতুন ক্যাটাগরি সিস্টেম)</h2>
          <p className="text-[13px] text-[#64748b]">এখান থেকে যেকোনো প্রোডাক্টের ছাড় সেট করতে পারবেন অথবা সম্পূর্ণ প্রোডাক্ট ডিলিট করতে পারবেন।</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 প্রোডাক্টের নাম, আইডি বা ক্যাটাগরি দিয়ে খুঁজুন..." 
            className="w-full py-3 px-4 border border-[#cbd5e1] rounded-[10px] text-[14px] outline-none bg-white text-black"
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-[#64748b] font-bold text-[13px]">প্রোডাক্ট লোড হচ্ছে...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-[#64748b] font-bold text-[13px] bg-white rounded-xl shadow-sm">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
          ) : (
            filteredProducts.map((item) => {
              let imgUrl = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : (item.imageUrl || 'https://via.placeholder.com/100');
              let currentDiscount = item.discount !== undefined ? item.discount : '';
              let productPin = item.productPin || item.id.slice(0, 6).toUpperCase();
              
              let mainCat = item.mainCategorySlug || item.mainCategory || 'N/A';
              let subCat = item.subCategorySlug || item.subCategory || 'N/A';
              let childCat = item.childSubCategorySlug || item.childSubCategory || '';

              return (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4 border border-slate-100">
                  <img src={imgUrl} className="w-[70px] h-[70px] rounded-lg object-cover bg-[#f1f5f9] flex-shrink-0" alt={item.title || 'Product'} />
                  
                  <div className="flex-grow">
                    <h4 className="text-[14px] font-bold text-[#0f172a] mb-1 line-clamp-1">{item.title}</h4>
                    <p className="text-[12px] text-[#475569] mb-0.5">আইডি: <b className="text-black">{productPin}</b></p>
                    <p className="text-[12px] text-[#475569] mb-0.5">ক্যাটাগরি: <span className="text-slate-800 font-semibold">{mainCat} &gt; {subCat} {childCat ? `> ${childCat}` : ''}</span></p>
                    <p className="text-[12px] text-[#475569] mb-1">মূল্য: <span className="text-[#e63946] font-bold">SAR {item.price}</span></p>
                    
                    <div className="flex gap-2 items-center mt-2 flex-wrap">
                      <input 
                        type="number" 
                        id={`discount_${item.id}`} 
                        defaultValue={currentDiscount} 
                        placeholder="ছাড় %" 
                        min="0" 
                        max="100"
                        className="w-20 py-1.5 px-2.5 border border-[#cbd5e1] rounded-md text-[13px] outline-none text-black"
                      />
                      <button 
                        onClick={() => updateProductDiscount(item.id)} 
                        className="bg-[#10b981] hover:bg-[#059669] text-white border-none py-1.5 px-3 rounded-md text-[12px] font-bold transition cursor-pointer"
                      >
                        সেভ করুন
                      </button>
                      
                      {currentDiscount !== '' && (
                        <button 
                          onClick={() => removeProductDiscount(item.id)} 
                          className="bg-[#f59e0b] hover:bg-[#d97706] text-white border-none py-1.5 px-2.5 rounded-md text-[12px] font-bold transition cursor-pointer"
                        >
                          অফার মুছুন
                        </button>
                      )}

                      <button 
                        onClick={() => deleteProductItem(item.id)} 
                        className="bg-[#ef4444] hover:bg-[#dc2626] text-white border-none py-1.5 px-2.5 rounded-md text-[12px] font-bold transition cursor-pointer"
                      >
                        প্রোডাক্ট ডিলিট
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
