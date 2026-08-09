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
      
      <div className="bg-[#e63946] text-white p-3.5 flex items-center gap-3.5 sticky top-0 z-[100] shadow-sm">
        <Link href="/" className="bg-white/20 text-white text-[16px] px-3 py-1.5 rounded-lg font-bold no-underline">
          ⬅ ব্যাক
        </Link>
        <h1 className="text-[18px] uppercase font-bold">সকল ক্যাটাগরি</h1>
      </div>

      <div className="max-w-[600px] mx-auto p-3 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-[#666] font-bold">ক্যাটাগরি লোড হচ্ছে...</div>
        ) : mainCategories.length === 0 ? (
          <div className="text-center py-20 text-[#666] font-bold">কোনো ক্যাটাগরি পাওয়া যায়নি!</div>
        ) : (
          mainCategories.map((mainCat) => {
            const relatedSubs = subCategories.filter(
              sub => sub.mainCat?.toLowerCase().trim() === mainCat.name?.toLowerCase().trim()
            );

            return (
              <div key={mainCat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                
                <Link href={`/?category=${encodeURIComponent(mainCat.name)}`} className="flex-shrink-0">
                  <img 
                    src={mainCat.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={mainCat.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#e63946]"
                  />
                </Link>

                <div className="flex-grow">
                  <Link 
                    href={`/?category=${encodeURIComponent(mainCat.name)}`}
                    className="flex items-center justify-between font-bold text-[16px] text-[#222] pb-2 no-underline hover:text-[#e63946]"
                  >
                    <span>{mainCat.name}</span>
                    <span className="text-xs text-[#e63946] font-semibold">সব দেখুন →</span>
                  </Link>

                  <div className="pt-1">
                    {relatedSubs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">কোনো সাব-ক্যাটাগরি নেই</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {relatedSubs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/?category=${encodeURIComponent(mainCat.name)}&sub=${encodeURIComponent(sub.name)}`}
                            className="bg-gray-100 hover:bg-red-50 hover:text-[#e63946] text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all no-underline"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
