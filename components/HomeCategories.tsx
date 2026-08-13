'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function HomeCategories() {
  const [mainCats, setMainCats] = useState<any[]>([]);
  const [activeMain, setActiveMain] = useState('');
  const [subCats, setSubCats] = useState<any[]>([]);

  // ১. ফায়ারবেস থেকে রিয়েল-টাইমে মেইন ক্যাটাগরি ফেচ করা
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'mainCategories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMainCats(data);
      if (data.length > 0 && !activeMain) {
        setActiveMain(data[0].slug);
      }
    });
    return () => unsubscribe();
  }, [activeMain]);

  // ২. মেইন ক্যাটাগরি অনুযায়ী সাব-ক্যাটাগরি ফেচ করা
  useEffect(() => {
    if (!activeMain) return;
    const q = query(collection(db, 'subCategories'), where('mainCategorySlug', '==', activeMain));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubCats(data);
    });
    return () => unsubscribe();
  }, [activeMain]);

  if (mainCats.length === 0) return null;

  return (
    <div className="w-full bg-white shadow-sm mb-4">
      {/* লেভেল ১: মেইন ক্যাটাগরি হরিজন্টাল ট্যাব */}
      <div className="flex overflow-x-auto gap-3 p-3 scrollbar-none border-b border-gray-100">
        {mainCats.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveMain(cat.slug)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeMain === cat.slug 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* লেভেল ২: সাব-ক্যাটাগরি গ্রিড (আইকনসহ) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
        {subCats.map(sub => (
          <a 
            key={sub.id} 
            href={`/categories/${activeMain}/${sub.slug}`} 
            className="flex flex-col items-center group"
          >
            <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden shadow-sm group-hover:border-orange-500 transition-all">
              <img 
                src={sub.icon || '/placeholder.png'} 
                alt={sub.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            </div>
            <span className="text-xs text-center mt-2 text-gray-800 font-medium line-clamp-1">
              {sub.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

