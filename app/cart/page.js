'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [previouslyAdded, setPreviouslyAdded] = useState([]);

  // LocalStorage থেকে ডাটা লোড করা
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    const storedFavs = JSON.parse(localStorage.getItem('ayaat_favorites')) || [];
    const storedPrev = JSON.parse(localStorage.getItem('ayaat_previously_added')) || [];

    setCart(storedCart);
    setFavorites(storedFavs);
    setPreviouslyAdded(storedPrev);
  }, []);

  // কার্ট আইটেম রিমুভ করার ফাংশন
  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    const updatedPrev = [...previouslyAdded];
    
    const removedItem = updatedCart.splice(index, 1)[0];
    if (removedItem) {
      updatedPrev.unshift(removedItem);
      setPreviouslyAdded(updatedPrev);
      localStorage.setItem('ayaat_previously_added', JSON.stringify(updatedPrev));
    }

    setCart(updatedCart);
    localStorage.setItem('ayaat_cart', JSON.stringify(updatedCart));
  };

  // প্রিভিয়াসলি অ্যাডেড থেকে কার্টে ফিরিয়ে আনার ফাংশন
  const moveToCartFromPrevious = (index) => {
    const updatedCart = [...cart];
    const updatedPrev = [...previouslyAdded];
    
    const item = updatedPrev.splice(index, 1)[0];
    if (item) {
      updatedCart.push(item);
      setCart(updatedCart);
      setPreviouslyAdded(updatedPrev);
      localStorage.setItem('ayaat_cart', JSON.stringify(updatedCart));
      localStorage.setItem('ayaat_previously_added', JSON.stringify(updatedPrev));
    }
  };

  // পরিমাণ (Quantity) পরিবর্তন করার ফাংশন
  const changeQty = (index, change) => {
    const updatedCart = [...cart];
    if (updatedCart[index]) {
      updatedCart[index].quantity = (updatedCart[index].quantity || 1) + change;
      if (updatedCart[index].quantity < 1) updatedCart[index].quantity = 1;
      
      setCart(updatedCart);
      localStorage.setItem('ayaat_cart', JSON.stringify(updatedCart));
    }
  };

  // চেকআউট এ যাওয়ার ফাংশন
  const proceedToCheckout = (totalAmount) => {
    if (cart.length === 0) {
      alert("কার্ট খালি রয়েছে!");
      return;
    }
    localStorage.setItem('checkoutProduct', JSON.stringify({
      title: cart.map(i => `${i.title || i.name || i.productName || 'Product'} (${i.quantity}x)`).join(', '),
      price: totalAmount,
      id: cart.map(i => i.id).join(', ')
    }));
    router.push('/checkout');
  };

  // সাবটোটাল হিসাব করা
  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price || item.cost || item.productPrice || item.rate || 0);
    const qty = Number(item.quantity || 1);
    return acc + (price * qty);
  }, 0);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 text-center text-[16px] font-bold text-[#e63946] border-b border-[#eee]">
        Your cart
      </div>

      <div className="max-w-[600px] mx-auto p-2.5">
        
        {/* Cart Container */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-[10px] p-[30px_15px] text-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] mb-4">
            <div className="w-[70px] h-[70px] bg-[#fff5f5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#e63946] text-[28px]">
              🛒
            </div>
            <h3 className="text-[16px] mb-1.5 text-[#333]">Your cart</h3>
            <p className="text-[#666] text-[14px] mb-5">No items in your cart</p>
            <Link href="/" className="inline-block w-full bg-[#f27a1a] text-white text-center p-3 rounded-lg no-underline font-bold text-[15px]">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div>
            {cart.map((item, index) => {
              const itemTitle = item.title || item.name || item.productName || item.text || 'Product';
              const itemPrice = Number(item.price || item.cost || item.productPrice || item.rate || 0);
              const itemImage = item.image || item.img || item.imageUrl || item.photo || 'https://via.placeholder.com/100';
              const itemCategory = item.category || item.cat || '';

              return (
                <div key={index} className="flex bg-white rounded-[10px] p-2.5 mb-2 items-center border border-[#eee] shadow-[0_2px_5px_rgba(0,0,0,0.02)] relative">
                  <button 
                    onClick={() => removeFromCart(index)} 
                    className="absolute top-2 right-2 bg-none border-none text-[#999] text-[16px] cursor-pointer"
                  >
                    ✕
                  </button>
                  <img src={itemImage} alt={itemTitle} className="w-[70px] h-[70px] object-cover rounded-lg mr-2.5" />
                  <div className="flex-grow">
                    <h4 className="text-[13px] font-bold text-[#333] mb-1">{itemTitle}</h4>
                    
                    {itemCategory && (
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded mb-1">
                        {itemCategory}
                      </span>
                    )}

                    <p className="text-[12px] text-[#666] mb-1">সাইজ: {item.size || 'N/A'}</p>
                    <div className="text-[#e63946] text-[14px] font-bold">SAR {itemPrice}</div>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => changeQty(index, -1)} className="bg-[#f1f3f5] border border-[#dee2e6] w-[22px] h-[22px] font-bold cursor-pointer rounded text-black">-</button>
                      <span className="text-black font-semibold">{item.quantity || 1}</span>
                      <button onClick={() => changeQty(index, 1)} className="bg-[#f1f3f5] border border-[#dee2e6] w-[22px] h-[22px] font-bold cursor-pointer rounded text-black">+</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary Card */}
            <div className="bg-white rounded-[10px] p-4 mt-4 border border-[#eee]">
              <div className="flex justify-between text-[14px] mb-2 text-[#444]">
                <span>সাবটোটাল</span>
                <span>SAR {subtotal}</span>
              </div>
              <div className="flex justify-between text-[14px] mb-2 text-[#444]">
                <span>ডেলিভারি চার্জ</span>
                <span>SAR 0</span>
              </div>
              <div className="flex justify-between font-bold text-[16px] text-[#e63946] border-t border-dashed border-[#ddd] pt-2 mt-2">
                <span>মোট প্রদেয়</span>
                <span>SAR {subtotal}</span>
              </div>
              <button 
                onClick={() => proceedToCheckout(subtotal)} 
                className="block w-full bg-[#e63946] text-white text-center p-3 rounded-lg font-bold text-[15px] mt-4 border-none cursor-pointer"
              >
                অর্ডার কনফার্ম করুন
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Tabs Section (Previously Added) */}
      <div className="max-w-[600px] mx-auto mt-5 px-2.5">
        <div className="flex gap-2.5 mb-3">
          <button className="bg-[#f27a1a] text-white border border-[#f27a1a] px-4 py-2.5 rounded-[20px] text-[13px] font-bold cursor-pointer">
            Previously added ({previouslyAdded.length})
          </button>
          <Link href="/favorites" className="bg-white border border-[#dee2e6] px-4 py-2.5 rounded-[20px] text-[13px] font-bold text-[#555] no-underline text-center inline-block">
            Favorites ({favorites.length})
          </Link>
        </div>

        <div>
          {previouslyAdded.length === 0 ? (
            <div className="text-center p-5 text-[#888] text-[13px]">কোনো পূর্ববর্তী কার্ট প্রোডাক্ট নেই।</div>
          ) : (
            previouslyAdded.map((item, index) => {
              const title = item.title || item.name || item.productName || item.text || 'Product';
              const price = item.price || item.cost || item.productPrice || item.rate || '0';
              const image = item.image || item.img || item.imageUrl || item.photo || 'https://via.placeholder.com/100';

              return (
                <div key={index} className="flex bg-white rounded-[10px] p-2.5 mb-2 items-center border border-[#eee] justify-between">
                  <div className="flex items-center">
                    <img src={image} alt={title} className="w-[60px] h-[60px] object-cover rounded-md mr-2.5" />
                    <div>
                      <h4 className="text-[13px] text-[#333] mb-0.5 font-bold">{title}</h4>
                      <div className="text-[#e63946] text-[13px] font-bold">SAR {price}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => moveToCartFromPrevious(index)} 
                    className="bg-white border border-[#e63946] text-[#e63946] px-3 py-1.5 rounded-md text-[12px] font-bold cursor-pointer hover:bg-[#e63946] hover:text-white transition"
                  >
                    Add to cart
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
