'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ProductsRoom() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // File select kore Base64 string-e convert korar function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Image size check (1MB er kom rakha bhalo database-er jonno)
    if (file.size > 1048576) {
      alert("Please select an image smaller than 1MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImage) {
      alert("Please select a product image!");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
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

        {/* Choose File Section */}
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Select Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="w-full p-2 border rounded text-sm bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
            required
          />
          {productImage && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={productImage} alt="Preview" className="w-12 h-12 object-cover rounded border" />
              <span className="text-xs text-green-600 font-medium">Image Loaded Successfully!</span>
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
            placeholder="e.g. Baby" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-bold"
        >
          {loading ? "Adding..." : "Add Product to Live Database"}
        </button>
      </form>
    </div>
  );
}
