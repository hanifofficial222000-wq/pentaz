'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  // Dummy cart items (pachhe dynamic state use korte parben)
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Barca Home Kit 2026', price: 550, quantity: 1, image: 'https://via.placeholder.com/150' }
  ]);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-700 text-white p-4 text-center font-bold text-base shadow">
        Shopping Cart
      </div>

      <div className="p-4 space-y-4">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-3" />
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-gray-800">{item.name}</h4>
                <p className="text-xs text-teal-600 font-bold mt-1">৳ {item.price}</p>
              </div>
              <div className="text-xs font-bold text-gray-600">Qty: {item.quantity}</div>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-gray-500 mt-10">Cart is empty!</p>
        )}

        {cartItems.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mt-6 space-y-3">
            <div className="flex justify-between text-sm font-bold text-gray-800">
              <span>Total Amount:</span>
              <span className="text-teal-600">৳ {totalAmount}</span>
            </div>
            <Link href="/checkout">
              <button className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-lg shadow">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
