'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function CategoryPage() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        // ১. মেইন ক্যাটাগরি ফেচ করা
        const mainQuery = query(collection(db, "mainCategories"), orderBy("createdAt", "desc"));
        const mainSnap = await getDocs(mainQuery);
        const mainList = mainSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMainCategories(mainList);

        // ২. সাব-ক্যাটাগরি ফেচ করা
        const subSnap = await getDocs(collection(db, "subCategories"));
        const subList = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubCategories(subList);

      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[60px] text-[#333] font-['Arial',sans-serif]">
      <div className="max-w-[500px] mx-auto p-[15px]">
        
        {/* Header Title */}
        <div className="bg-white rounded-[16px] p-[16px] mb-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#e63946] m-0 flex items-center gap-[8px]">
            📂 প্রোডাক্ট ক্যাটেগরি সমূহ
          </h2>
          <Link 
            href="/" 
            className="bg-[#f1f3f5] text-[#333] text-[12px] font-bold py-[6px] px-[12px] rounded-[8px] no-underline transition hover:bg-[#e2e6ea]"
          >
            ← হোম
          </Link>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-10 text-xs text-gray-400">
            ক্যাটেগরি লোড হচ্ছে...
          </div>
        ) : mainCategories.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500 bg-white rounded-[16px] p-6 shadow-sm border border-[#eee]">
            <p className="font-bold text-gray-700 mb-1">কোনো ক্যাটেগরি পাওয়া যায়নি!</p>
            <p>দয়া করে অ্যাডমিন প্যানেল থেকে ক্যাটেগরি যুক্ত করুন।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainCategories.map((cat) => {
              // এই মেইন ক্যাটাগরির অধীনে থাকা সাব-ক্যাটাগরিগুলো ফিল্টার করা
              const relatedSubs = subCategories.filter(sub => sub.mainCat === cat.name);
              const displayImg = (cat.imageUrls && cat.imageUrls[0]) || cat.imageUrl;

              return (
                <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  {/* Main Category Header */}
                  <Link 
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-3 pb-3 border-b border-slate-100 no-underline group"
                  >
                    {displayImg ? (
                      <img 
                        src={displayImg} 
                        alt={cat.name} 
                        className="w-12 h-12 object-cover rounded-full border border-gray-200 group-hover:scale-105 transition" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-50 text-[#e63946] rounded-full flex items-center justify-center text-lg font-bold border border-red-100">
                        📦
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#e63946] transition m-0">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 m-0">সকল পণ্য দেখতে ক্লিক করুন</p>
                    </div>
                  </Link>

                  {/* Sub Categories List */}
                  {relatedSubs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {relatedSubs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                          className="bg-slate-50 hover:bg-red-50 hover:text-[#e63946] hover:border-red-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition no-underline"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
