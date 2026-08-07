'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CategoriesRoom() {
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Please enter a category name!");
      return;
    }

    setLoading(true);
    try {
      // Sub-category-gulo comma diye alada ba ekti single string/array hishebe nite paren
      // Ekhane sub-categories-ke comma separated array-te convert kora hocche
      const subCategoriesArray = subCategoryName
        ? subCategoryName.split(',').map(sub => sub.trim()).filter(Boolean)
        : [];

      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        subCategories: subCategoriesArray,
        createdAt: new Date()
      });

      alert("Category & Sub-Categories Saved Successfully!");
      setCategoryName('');
      setSubCategoryName('');
    } catch (error) {
      alert("Error saving category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white p-4 md:p-6 rounded-lg shadow border mx-auto">
      <h1 className="text-lg md:text-xl font-bold mb-4 text-slate-800">Category & Sub-Category Room</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Main Category Name</label>
          <input 
            type="text" 
            placeholder="e.g. Jersey, Shoe, Baby" 
            value={categoryName} 
            onChange={(e) => setCategoryName(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Sub-Categories (Comma separated)</label>
          <input 
            type="text" 
            placeholder="e.g. T-Shirt, Polo, Hoodie (coma diye likhun)" 
            value={subCategoryName} 
            onChange={(e) => setSubCategoryName(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
          />
          <p className="text-[11px] text-gray-400 mt-1">Ektadhik sub-category thakle comma (,) diye likhun.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white p-3 rounded text-sm font-bold"
        >
          {loading ? "Saving..." : "Save Category to Database"}
        </button>
      </form>
    </div>
  );
}
