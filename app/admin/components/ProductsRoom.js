'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ProductsRoom() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  // File select kore automatic ImgBB-e upload korar function
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Free ImgBB API key use kore upload kora hochche
      const response = await fetch('https://api.imgbb.com/1/upload?key=6d207e02193a847aa98d0a2a901485a3', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setProductImage(data.data.url);
        alert("Image Uploaded Successfully!");
      } else {
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImage) {
      alert("Please upload an image first!");
      return;
    }

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
    <div className="w-full max-w-xl bg-white p-4 md:p-6 rounded-lg shadow border mx-auto">
      <h1 className="text-lg md:text-xl font-bold mb-4 text-slate-800">Products Add & Manage Room</h1>
      <form onSubmit={handleAddProduct} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Product Name</label>
          <input 
            type="text" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Price (৳)</label>
          <input 
            type="number" 
            value={productPrice} 
            onChange={(e) => setProductPrice(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            required 
          />
        </div>

        {/* Choose File / Image Upload Section */}
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Select Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="w-full p-2 border rounded text-sm bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
          />
          {uploading && <p className="text-xs text-teal-600 mt-1 font-semibold">Uploading image, please wait...</p>}
          {productImage && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={productImage} alt="Preview" className="w-12 h-12 object-cover rounded border" />
              <span className="text-xs text-green-600 font-medium">Image Ready!</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Category Name</label>
          <input 
            type="text" 
            value={productCategory} 
            onChange={(e) => setProductCategory(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            placeholder="e.g. Jersey" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-bold"
        >
          Add Product to Live Database
        </button>
      </form>
    </div>
  );
}
