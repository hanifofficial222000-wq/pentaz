'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Category {
  id: string;
  slug?: string;
  name?: string;
  icon?: string;
  imageUrl?: string;
  [key: string]: any;
}

export default function HomeCategories() {
  const [mainCats, setMainCats] = useState<Category[]>([]);
  const [subCats, setSubCats] = useState<Category[]>([]);

  // ১. সব মেইন ক্যাটাগরি ফেচ করা (টপ ব্যানারের উপরে ১ লাইনে সার্কেল কার্ড)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'mainCategories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setMainCats(data);
    });
    return () => unsubscribe();
  }, []);

  // ২. সব সাব-ক্যাটাগরি ফেচ করা (টপ ব্যানারের নিচে ২ লাইনে সার্কেল কার্ড)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'subCategories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setSubCats(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full bg-white mb-3">
      {/* ১. টপ ব্যানারের ওপরে: মেইন ক্যাটাগরি (১ লাইনে সার্কেল আইকন স্ক্রোল) */}
      {mainCats.length > 0 && (
        <div className="flex overflow-x-auto gap-4 p-3 scrollbar-none border-b border-gray-100 bg-white">
          {mainCats.map(cat => (
            <a 
              key={cat.id} 
              href={`/categories/${cat.slug || cat.id}`}
              className="flex flex-col items-center flex-shrink-0 group"
            >
              <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden shadow-sm group-hover:border-orange-500 transition-all p-0.5 bg-white">
                <img 
                  src={cat.icon || cat.imageUrl || '/placeholder.png'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" 
                />
              </div>
              <span className="text-[11px] text-center mt-1.5 text-gray-800 font-medium line-clamp-1 max-w-[65px]">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* ২. টপ ব্যানারের নিচে: সাব-ক্যাটাগরি (সার্কেল কার্ড গ্রিড স্টাইল) */}
      {subCats.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 p-3 bg-gray-50/60">
          {subCats.map(sub => (
            <a 
              key={sub.id} 
              href={`/categories/${sub.mainCategorySlug || sub.mainCat || 'all'}/${sub.slug || sub.id}`} 
              className="flex flex-col items-center group"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-gray-200 overflow-hidden shadow-sm group-hover:border-orange-500 transition-all bg-white p-0.5">
                <img 
                  src={sub.icon || sub.imageUrl || '/placeholder.png'} 
                  alt={sub.name} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" 
                />
              </div>
              <span className="text-[11px] text-center mt-1.5 text-gray-800 font-medium line-clamp-1">
                {sub.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
