'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

function CategoryProductsContent() {
  const searchParams = useSearchParams();
  const targetCategory = searchParams.get('cat') ? searchParams.get('cat').toLowerCase().trim() : '';

  const [pageTitle, setPageTitle] = useState('সকল প্রডাক্ট');
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCat, setActiveSubCat] = useState('all');

  useEffect(() => {
    if (!targetCategory) {
      setPageTitle("সকল প্রডাক্ট (All Products)");
      loadAllProducts();
    } else {
      setPageTitle(targetCategory.toUpperCase().replace(/-/g, ' '));
      
      if (['special', 'special-offers', 'special_offer'].includes(targetCategory)) {
        loadSpecialOfferProducts();
      } else {
        loadMainCategoryAndProducts(targetCategory);
      }
    }
  }, [targetCategory]);

  // ১. মেইন ক্যাটাগরি এবং সাব-ক্যাটাগরি লোড করার ফাংশন
  async function loadMainCategoryAndProducts(cat) {
    try {
      setLoading(true);
      const [pSnapshot, subSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "subCategories"))
      ]);
      
      const matchedProducts = [];
      pSnapshot.forEach(docSnap => {
        const item = docSnap.data();
        if (item.approved === true) {
          const itemMainCat = (item.mainCategory || '').toString().toLowerCase().trim();
          if (itemMainCat === cat) {
            matchedProducts.push({ id: docSnap.id, ...item });
          }
        }
      });

      // সাব-ক্যাটাগরি বের করা
      const relatedSubCats = [];
      subSnap.forEach(docSnap => {
        const subData = docSnap.data();
        const subMainCat = (subData.mainCat || '').toString().toLowerCase().trim();
        if (subMainCat === cat) {
          relatedSubCats.push(subData.name);
        }
      });

      setProducts(matchedProducts);
      setSubCategories(relatedSubCats);
      setActiveSubCat('all');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ২. সব প্রোডাক্ট লোড করার ফাংশন
  async function loadAllProducts() {
    try {
      setLoading(true);
      const pSnapshot = await getDocs(collection(db, "products"));
      const allProducts = [];
      pSnapshot.forEach(docSnap => {
        const item = docSnap.data();
        if (item.approved === true) {
          allProducts.push({ id: docSnap.id, ...item });
        }
      });
      setProducts(allProducts);
      setSubCategories([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ৩. স্পেশাল অফার প্রোডাক্ট লোড করার ফাংশন
  async function loadSpecialOfferProducts() {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "specialOffers"));
      const specialList = [];
      querySnapshot.forEach(docSnap => {
        specialList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProducts(specialList);
      setSubCategories([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ফিল্টার অনুযায়ী প্রডাক্ট ফিল্টার করা
  const filteredProducts = activeSubCat === 'all' 
    ? products 
    : products.filter(item => (item.category || '').toString().toLowerCase().trim() === activeSubCat);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[80px] font-sans">
      
      {/* HEADER */}
      <div className="bg-[#e63946] text-white p-3.5 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.1)] sticky top-0 z-[100]">
        <Link href="/" className="bg-[rgba(255,255,255,0.2)] text-white border-none text-[18px] px-3 py-1.5 rounded-lg cursor-pointer no-underline font-bold">
          ⬅ ব্যাক
        </Link>
        <h1 className="text-[18px] uppercase">{pageTitle}</h1>
      </div>

      {/* SUB-CATEGORY FILTER CHIPS BAR */}
      {subCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-[#eee] whitespace-nowrap [&::-webkit-scrollbar]:hidden">
          <button 
            onClick={() => setActiveSubCat('all')}
            className={`px-3.5 py-1.5 rounded-[20px] text-[12px] font-bold cursor-pointer border transition ${activeSubCat === 'all' ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]'}`}
          >
            সব ({products.length})
          </button>
          {subCategories.map((subName, idx) => {
            const formattedSub = subName.toLowerCase().trim();
            return (
              <button 
                key={idx}
                onClick={() => setActiveSubCat(formattedSub)}
                className={`px-3.5 py-1.5 rounded-[20px] text-[12px] font-bold cursor-pointer border transition ${activeSubCat === formattedSub ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]'}`}
              >
                {subName}
              </button>
            );
          })}
        </div>
      )}

      {/* PRODUCTS GRID CONTAINER */}
      <div className="max-w-[600px] mx-auto mt-4 px-2.5">
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-2 text-center py-10 text-[#666] font-bold">প্রোডাক্ট লোড হচ্ছে...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-[#666] font-bold">এই ক্যাটাগরিতে কোনো প্রডাক্ট পাওয়া যায়নি!</div>
          ) : (
            filteredProducts.map((item) => {
              const itemImg = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : (item.imageUrl || item.image || 'https://via.placeholder.com/200');
              const isSpecial = ['special', 'special-offers', 'special_offer'].includes(targetCategory);

              return (
                <Link 
                  key={item.id} 
                  href={isSpecial ? "/special-offer" : `/product?id=${item.id}`} 
                  className="border border-[#eee] rounded-xl overflow-hidden bg-white text-[#333] flex flex-col no-underline shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <img src={itemImg} alt={item.title || item.name} className="w-full h-[160px] object-cover" />
                  <div className="p-2.5 flex flex-col justify-between flex-grow">
                    <h3 className="text-[13px] font-bold mb-1.5 leading-[1.3] text-[#222]">
                      {item.title || item.name || 'Product'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#e63946] text-[15px] font-bold">
                        SAR {item.price || item.discountPrice || 0}
                      </span>
                      {item.regularPrice && (
                        <span className="text-[#999] text-[12px] line-through">SAR {item.regularPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

// Next.js-এ useSearchParams ব্যবহারের জন্য Suspense बाउंड্রি দিয়ে র‍্যাপ করা ভালো
export default function CategoryProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 font-bold text-black">লোড হচ্ছে...</div>}>
      <CategoryProductsContent />
    </Suspense>
  );
}
