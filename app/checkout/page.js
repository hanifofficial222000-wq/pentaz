'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CheckoutPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: name,
        phone: phone,
        address: address,
        status: "Pending",
        createdAt: new Date()
      });
      alert("Order Placed Successfully!");
      setName('');
      setPhone('');
      setAddress('');
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-700 text-white p-4 text-center font-bold text-base shadow">
        Checkout Information
      </div>

      <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Delivery Address</label>
            <textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600" 
              rows="3" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-3 rounded-lg shadow"
        >
          {loading ? "Placing Order..." : "Confirm & Place Order"}
        </button>
      </form>
    </div>
  );
}
