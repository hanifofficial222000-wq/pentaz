'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CategoriesPage() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const mainSnap = await getDocs(collection(db, 'mainCategories'));
        setMainCategories(mainSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const subSnap = await getDocs(collection(db, 'subCategories'));
        setSubCategories(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[80px] font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="bg-[#e63946] text-white p-3.5 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.1)] sticky top-0 z-[100]">
        <Link href="/" className="bg-[rgba(255,255,255,0.2)] text-white border-none text-[18px] px-3 py-1.5 rounded-lg cursor-pointer no-underline font-bold">
          ⬅ ব্যাক
        </Link>
        <h1 className="text-[18px] uppercase font-bold">সকল ক্যাটাগরি</h1>
      </div>

      {/* CATEGORIES CONTAINER */}
      <div className="max-w-[600px] mx-auto p-3 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-[#666] font-bold">ক্যাটাগরি লোড হচ্ছে...</div>
        ) : mainCategories.length === 0 ? (
          <div className="text-center py-20 text-[#666] font-bold">কোনো ক্যাটাগরি পাওয়া যায়নি!</div>
        ) : (
          mainCategories.map((mainCat) => {
            // সংশ্লিষ্ট সাব-ক্যাটাগরি ফিল্টার করা
            const relatedSubs = subCategories.filter(
              sub => sub.mainCat?.toLowerCase().trim() === mainCat.name?.toLowerCase().trim()
            );

            return (
              <div key={mainCat.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_6px_rgba(0,0,0,0.04)] border border-[#eee]">
                
                {/* Main Category Link */}
                <Link 
                  href={`/?category=${encodeURIComponent(mainCat.name)}`}
                  className="flex items-center justify-between font-bold text-[15px] text-[#222] pb-3 border-b border-gray-100 no-underline hover:text-[#e63946] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    📁 {mainCat.name}
                  </span>
                  <span className="text-xs text-[#e63946] font-semibold">সব দেখুন →</span>
                </Link>

                {/* Sub Categories Chips */}
                <div className="pt-3">
                  {relatedSubs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">কোনো সাব-ক্যাটাগরি নেই</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {relatedSubs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/?category=${encodeURIComponent(mainCat.name)}&sub=${encodeURIComponent(sub.name)}`}
                          className="bg-[#f1f5f9] hover:bg-red-50 hover:border-[#e63946] hover:text-[#e63946] border border-[#cbd5e1] text-[#475569] text-[12px] font-bold px-3 py-1.5 rounded-[20px] transition-all no-underline"
                        >
                          📂 {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
