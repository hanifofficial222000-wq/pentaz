'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CategorySlider({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const catList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="flex overflow-x-auto space-x-4 p-4 bg-white shadow-sm no-scrollbar">
      {/* 'All' Category Button */}
      <div 
        onClick={() => onSelectCategory && onSelectCategory('All')} 
        className="flex-shrink-0 w-20 text-center cursor-pointer"
      >
        <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center text-xs font-semibold border shadow-inner ${selectedCategory === 'All' ? 'bg-teal-700 text-white border-teal-800' : 'bg-gray-100 text-gray-600'}`}>
          🔥
        </div>
        <p className="text-xs mt-1 font-medium text-gray-700">All</p>
      </div>

      {/* Database Dynamic Categories */}
      {categories.map((cat) => {
        const catName = cat.name || cat.categoryName;
        const isSelected = selectedCategory === catName;
        
        return (
          <div 
            key={cat.id} 
            onClick={() => onSelectCategory && onSelectCategory(catName)} 
            className="flex-shrink-0 w-20 text-center cursor-pointer"
          >
            <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center text-xs font-semibold border shadow-inner overflow-hidden ${isSelected ? 'bg-teal-700 text-white border-teal-800' : 'bg-gray-100 text-gray-600'}`}>
              {cat.image ? (
                <img src={cat.image} alt={catName} className="h-full w-full object-cover" />
              ) : (
                '🏷️'
              )}
            </div>
            <p className="text-xs mt-1 font-medium text-gray-700 truncate">{catName}</p>
          </div>
        );
      })}
    </div>
  );
}
