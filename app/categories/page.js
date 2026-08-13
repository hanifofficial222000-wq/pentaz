'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারবেস থেকে ক্যাটেগরি লোড করার ফাংশন
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCategories(list);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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

        {/* Categories Grid/List */}
        {loading ? (
          <div className="text-center py-10 text-xs text-gray-400">
            ক্যাটেগরি লোড হচ্ছে...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500 bg-white rounded-[16px] p-6 shadow-sm border border-[#eee]">
            <p className="font-bold text-gray-700 mb-1">কোনো ক্যাটেগরি পাওয়া যায়নি!</p>
            <p>দয়া করে অ্যাডমিন প্যানেল থেকে ক্যাটেগরি যুক্ত করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[12px]">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/?category=${encodeURIComponent(cat.name)}`}
                className="bg-white p-[14px] rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#eee] flex flex-col items-center text-center no-underline transition hover:border-[#e63946] hover:shadow-md group"
              >
                {cat.imageUrl ? (
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.name} 
                    className="w-[50px] h-[50px] object-cover rounded-full mb-[10px] border border-gray-200 group-hover:scale-105 transition" 
                  />
                ) : (
                  <div className="w-[50px] h-[50px] bg-red-50 text-[#e63946] rounded-full flex items-center justify-center text-[20px] mb-[10px] font-bold border border-red-100">
                    📦
                  </div>
                )}
                <h3 className="text-[13px] font-bold text-[#333] group-hover:text-[#e63946] transition line-clamp-1 m-0">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
