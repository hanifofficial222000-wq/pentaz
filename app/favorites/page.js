'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ক্যাটাগরি এবং প্রোডাক্টসমূহ ডাটাবেস থেকে ফেচ করা
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // ১. সব অ্যাপ্রুভড প্রোডাক্ট ফেচ করা
        const q = query(collection(db, "products"), where("approved", "==", true));
        const querySnapshot = await getDocs(q);
        
        let prods = [];
        let catsSet = new Set();

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const prodObj = { id: docSnap.id, ...data };
          prods.push(prodObj);

          // ক্যাটাগরিগুলো সংগ্রহ করা
          if (data.category) {
            catsSet.add(data.category);
          }
        });

        setProducts(prods);
        setCategories(['All', ...Array.from(catsSet)]);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // সিলেক্ট করা ক্যাটাগরি অনুযায়ী প্রোডাক্ট ফিল্টার করা
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[80px] text-[#333] font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 text-center text-[16px] font-bold text-[#e63946] border-b border-[#eee]">
        📂 প্রোডাক্ট ক্যাটাগরি ও ফিল্টার
      </div>

      <div className="max-w-[600px] mx-auto p-2.5">
        
        {/* Category Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition ${
                selectedCategory === cat 
                  ? 'bg-[#e63946] text-white shadow-md' 
                  : 'bg-white text-[#555] border border-[#dee2e6]'
              }`}
            >
              {cat === 'All' ? 'সকল প্রোডাক্ট' : cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">প্রোডাক্ট লোড হচ্ছে...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[10px] p-[30px_15px] text-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] mb-4">
            <h3 className="text-[16px] mb-1.5 text-[#333]">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
            <p className="text-[#666] text-[14px]">এই ক্যাটাগরিতে বর্তমানে কোনো প্রোডাক্ট নেই।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((item) => {
              const itemId = item.id;
              const itemTitle = item.title || item.name || 'Product';
              const itemPrice = Number(item.price || 0);
              const itemImage = item.image || item.imageUrl || (item.imageUrls && item.imageUrls[0]) || 'https://via.placeholder.com/150';
              const discPercent = Number(item.discount) || 0;
              
              let finalPrice = itemPrice;
              if (discPercent > 0) {
                finalPrice = Math.round(itemPrice - (itemPrice * discPercent) / 100);
              }

              return (
                <Link 
                  key={itemId} 
                  href={`/product/${itemId}`} 
                  className="bg-white rounded-[10px] p-2.5 border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] no-underline flex flex-col justify-between transition hover:shadow-md"
                >
                  <div className="relative">
                    {discPercent > 0 && (
                      <span className="absolute top-1 left-1 bg-[#e63946] text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        {discPercent}% OFF
                      </span>
                    )}
                    <img src={itemImage} alt={itemTitle} className="w-full h-[140px] object-cover rounded-lg mb-2" />
                  </div>

                  <div>
                    <h4 className="text-[13px] font-bold text-[#333] mb-1 line-clamp-2">{itemTitle}</h4>
                    {item.category && (
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded mb-1">
                        {item.category}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#e63946] text-[14px] font-bold">৳ {finalPrice}</span>
                      {discPercent > 0 && (
                        <span className="text-gray-400 text-[11px] line-through">৳ {itemPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
