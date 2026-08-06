'use client';
import { useState } from 'react';

export default function CategoriesRoom() {
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    alert("Category Saved Successfully!");
    setCategoryName('');
    setSubCategoryName('');
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-lg shadow border">
      <h1 className="text-xl font-bold mb-4 text-slate-800">Category & Sub-Category Room</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <input type="text" placeholder="Main Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full p-2 border rounded text-sm" required />
        <input type="text" placeholder="Sub-Category Name" value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} className="w-full p-2 border rounded text-sm" />
        <button type="submit" className="w-full bg-teal-700 text-white p-2.5 rounded text-sm font-bold">Save Category</button>
      </form>
    </div>
  );
}
