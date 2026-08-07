'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

// Alada component gulo import kora hochche (apnar folder path onujayi)
import ProductsRoom from './components/ProductsRoom';
import CategoriesRoom from './components/CategoriesRoom';
import BannersRoom from './components/BannersRoom';
import OrdersRoom from './components/OrdersRoom';
import ChatRoom from './components/ChatRoom';
import DiscountsRoom from './components/DiscountsRoom';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg border">
        <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Admin Control Room Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@ayaatshop.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white p-2.5 rounded text-sm font-bold"
          >
            {loading ? "Logging in..." : "Login to Admin"}
          </button>
        </form>
      </div>
    );
  }

  // Admin Dashboard with Sidebar & Components
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      
      {/* Sidebar - Rooms Navigation */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-4 space-y-2 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 text-teal-400 border-b border-slate-800 pb-2">Admin Control Rooms</h2>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
            <button onClick={() => setActiveTab('products')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'products' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🛍️ Products
            </button>
            <button onClick={() => setActiveTab('categories')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'categories' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              📁 Categories
            </button>
            <button onClick={() => setActiveTab('banners')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'banners' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🖼️ Banners
            </button>
            <button onClick={() => setActiveTab('orders')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'orders' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              📦 Orders
            </button>
            <button onClick={() => setActiveTab('chat')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'chat' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              💬 Chat
            </button>
            <button onClick={() => setActiveTab('discounts')} className={`text-left p-2.5 rounded text-xs md:text-sm font-medium ${activeTab === 'discounts' ? 'bg-teal-600' : 'hover:bg-slate-800'}`}>
              🏷️ Discounts
            </button>
          </div>
        </div>
        
        <button onClick={() => signOut(auth)} className="mt-4 md:mt-0 w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm font-bold">
          Logout Admin
        </button>
      </div>

      {/* Main Content Area (Renders respective component based on activeTab) */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'products' && <ProductsRoom />}
        {activeTab === 'categories' && <CategoriesRoom />}
        {activeTab === 'banners' && <BannersRoom />}
        {activeTab === 'orders' && <OrdersRoom />}
        {activeTab === 'chat' && <ChatRoom />}
        {activeTab === 'discounts' && <DiscountsRoom />}
      </div>
    </div>
  );
}
