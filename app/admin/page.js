'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // Form States for Product Room
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');

  // Form States for Category Room
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');

  // Form States for Banner Room
  const [topBannerText, setTopBannerText] = useState('');
  const [popupBannerImage, setPopupBannerImage] = useState('');

  const ADMIN_EMAIL = "admin@ayaatshop.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  // Product Add Handler
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

  // Jodi admin login na thake
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg border">
        <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Admin Control Room Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600"
            required
          />
          <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white p-2 rounded text-sm font-bold">Login to Admin</button>
        </form>
      </div>
    );
  }

  // Admin Logged-in Dashboard (Multi-Room Tabs)
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar - Rooms Navigation */}
      <div className="w-64 bg-slate-900 text-white p-5 space-y-2 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-6 text-teal-400 border-b border-slate-800 pb-3">Admin Control Rooms</h2>
          <div className="space-y-1">
            <button onClick={() => setActiveTab('products')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'products' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🛍️ Products Add Room
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'categories' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              📁 Category & Sub-Category
            </button>
            <button onClick={() => setActiveTab('banners')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'banners' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🖼️ Banners & Popup Ads
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'orders' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              📦 Order Handling Room
            </button>
            <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'chat' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              💬 Customer Chat Room
            </button>
            <button onClick={() => setActiveTab('discounts')} className={`w-full text-left p-2.5 rounded text-sm font-medium ${activeTab === 'discounts' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🏷️ Offers & Discounts Room
            </button>
          </div>
        </div>
        
        <button onClick={() => signOut(auth)} className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm font-bold">
          Logout Admin
        </button>
      </div>

      {/* Main Content Area (Active Room Display) */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* 1. Products Room */}
        {activeTab === 'products' && (
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
        )}

        {/* 2. Category Room */}
        {activeTab === 'categories' && (
          <div className="max-w-xl bg-white p-6 rounded-lg shadow border">
            <h1 className="text-xl font-bold mb-4 text-slate-800">Category & Sub-Category Room</h1>
            <div className="space-y-4">
              <input type="text" placeholder="Main Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full p-2 border rounded text-sm" />
              <input type="text" placeholder="Sub-Category Name" value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} className="w-full p-2 border rounded text-sm" />
              <button onClick={() => alert("Category Saved!")} className="w-full bg-teal-700 text-white p-2.5 rounded text-sm font-bold">Save Category</button>
            </div>
          </div>
        )}

        {/* 3. Banners & Popup Ads Room */}
        {activeTab === 'banners' && (
          <div className="max-w-xl bg-white p-6 rounded-lg shadow border">
            <h1 className="text-xl font-bold mb-4 text-slate-800">Banner & Popup Ads Room</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-gray-600">Top Banner Text / Image URL</label>
                <input type="text" value={topBannerText} onChange={(e) => setTopBannerText(e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-gray-600">Popup Banner / Ad Image URL</label>
                <input type="text" value={popupBannerImage} onChange={(e) => setPopupBannerImage(e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <button onClick={() => alert("Banners Updated!")} className="w-full bg-teal-700 text-white p-2.5 rounded text-sm font-bold">Update Banners</button>
            </div>
          </div>
        )}

        {/* 4. Orders Room */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h1 className="text-xl font-bold mb-4 text-slate-800">Order Handling Room</h1>
            <p className="text-sm text-gray-500">Customer-der dewa order gulo ekhane list akare dekha jabe ebong status update kora jabe.</p>
          </div>
        )}

        {/* 5. Chat Room */}
        {activeTab === 'chat' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h1 className="text-xl font-bold mb-4 text-slate-800">Customer Chat Room</h1>
            <p className="text-sm text-gray-500">Live chat interface jekhane customer-der sathe kotha bola jabe.</p>
          </div>
        )}

        {/* 6. Discounts Room */}
        {activeTab === 'discounts' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h1 className="text-xl font-bold mb-4 text-slate-800">Offers & Discounts Room</h1>
            <p className="text-sm text-gray-500">Coupon code ebong product-wise percentage discount set korar room.</p>
          </div>
        )}

      </div>
    </div>
  );
}
