'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ProductsRoom() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(productPrice),
        image: productImage,
        category: productCategory,
        createdAt: new Date()
      });
      alert("Product Added Successfully to Database!");
      setProductName('');
      setProductPrice('');
      setProductImage('');
      setProductCategory('');
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-lg shadow border">
      <h1 className="text-xl font-bold mb-4 text-slate-800">Products Add & Manage Room</h1>
      <form onSubmit={handleAddProduct} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Product Name</label>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full p-2 border rounded text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Price (৳)</label>
          <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full p-2 border rounded text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Image URL</label>
          <input type="text" value={productImage} onChange={(e) => setProductImage(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="https://..." required />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Category Name</label>
          <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. Jersey" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded text-sm font-bold">Add Product to Live Database</button>
      </form>
    </div>
  );
}
