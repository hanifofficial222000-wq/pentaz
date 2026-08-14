'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface Category {
  id: string;
  slug: string;
  name?: string;
  icon?: string;
  [key: string]: any;
}

export default function HomeCategories() {
  const [mainCats, setMainCats] = useState<Category[]>([]);
  const [activeMain, setActiveMain] = useState('');
  const [subCats, setSubCats] = useState<Category[]>([]);

  // ১. ফায়ারবেস থেকে রিয়েল-টাইমে মেইন ক্যাটাগরি ফেচ করা
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'mainCategories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setSubCats(data);
    });
    return () => unsubscribe();
  }, [activeMain]);

  if (mainCats.length === 0) return null;

  return (
    <div className="w-full bg-white shadow-sm mb-4">
      {/* মেইন ক্যাটাগরি: ১ লাইনে সার্কেল কার্ড স্টাইল (আইকনসহ) */}
      <div className="flex overflow-x-auto gap-4 p-3 scrollbar-none border-b border-gray-100 bg-white">
        {mainCats.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveMain(cat.slug)}
            className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
          >
            <div className={`w-14 h-14 rounded-full border-2 overflow-hidden shadow-sm transition-all p-0.5 ${
              activeMain === cat.slug 
                ? 'border-orange-500 ring-2 ring-orange-200 scale-105' 
                : 'border-gray-200 group-hover:border-orange-400'
            }`}>
              <img 
                src={cat.icon || '/placeholder.png'} 
                alt={cat.name} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <span className={`text-xs text-center mt-1.5 font-medium line-clamp-1 max-w-[70px] ${
              activeMain === cat.slug ? 'text-orange-600 font-bold' : 'text-gray-700'
            }`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* সাব-ক্যাটাগরি: সার্কেল স্টাইল গ্রিড (আইকনসহ) */}
      {subCats.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 bg-gray-50/50">
          {subCats.map(sub => (
            <a 
              key={sub.id} 
              href={`/categories/${activeMain}/${sub.slug}`} 
              className="flex flex-col items-center group"
            >
              <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden shadow-sm group-hover:border-orange-500 transition-all bg-white p-0.5">
                <img 
                  src={sub.icon || '/placeholder.png'} 
                  alt={sub.name} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" 
                />
              </div>
              <span className="text-xs text-center mt-1.5 text-gray-800 font-medium line-clamp-1">
                {sub.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
