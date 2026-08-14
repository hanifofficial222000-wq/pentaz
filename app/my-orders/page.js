'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('অর্ডারগুলো খোঁজা হচ্ছে...');

  // স্ট্যাটাস ক্লাস নির্ধারণ করার ফাংশন
  const getStatusClass = (status) => {
    if (!status) return 'bg-amber-50 text-amber-600 border border-amber-200';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'bg-amber-50 text-amber-600 border border-amber-200';
    if (s.includes('packaging')) return 'bg-blue-50 text-blue-600 border border-blue-200';
    if (s.includes('processing')) return 'bg-purple-50 text-purple-600 border border-purple-200';
    if (s.includes('received')) return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (s.includes('delivery') || s.includes('delivered')) return 'bg-teal-50 text-teal-600 border border-teal-200';
    if (s.includes('cancel')) return 'bg-rose-50 text-rose-600 border border-rose-200';
    return 'bg-amber-50 text-amber-600 border border-amber-200';
  };

  // অর্ডার ফেচ করার ফাংশন
  const fetchUserOrders = useCallback(async (customPhone = null) => {
    setLoading(true);
    setStatusMessage('অর্ডারগুলো খোঁজা হচ্ছে...');

    let savedPhones = JSON.parse(localStorage.getItem("userPhones") || "[]");
    let singlePhone = localStorage.getItem("userPhone");
    
    if (singlePhone && !savedPhones.includes(singlePhone)) {
      savedPhones.push(singlePhone);
    }

    if (customPhone) {
      const cleanCustom = customPhone.replace(/\D/g, '');
      if (cleanCustom && !savedPhones.includes(cleanCustom)) {
        savedPhones.push(cleanCustom);
      }
      localStorage.setItem("userPhones", JSON.stringify(savedPhones));
      localStorage.setItem("userPhone", cleanCustom);
    }

    if (savedPhones.length === 0 || (savedPhones.length === 1 && savedPhones[0] === "01835302525")) {
      const userPhoneInput = prompt("আপনার অর্ডার চেক করার জন্য মোবাইল নম্বরটি লিখুন:");
      if (userPhoneInput && userPhoneInput.trim() !== "") {
        const cleanNum = userPhoneInput.replace(/\D/g, '');
        savedPhones = [cleanNum];
        localStorage.setItem("userPhones", JSON.stringify(savedPhones));
        localStorage.setItem("userPhone", cleanNum);
      } else {
        setLoading(false);
        setStatusMessage('নম্বর পাওয়া যায়নি। দয়া করে ওপরের নম্বর পরিবর্তন অপশনে ক্লিক করে আপনার নম্বর দিন।');
        setOrders([]);
        return;
      }
    }

    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let foundOrders = [];

      for (const docSnap of querySnapshot.docs) {
        const order = docSnap.data();
        const dbPhoneRaw = String(order.phone || order.custPhone || order.customerPhone || order.mobile || "").trim();
        const dbPhoneClean = dbPhoneRaw.replace(/\D/g, '');
        
        for (const phone of savedPhones) {
          if (phone && dbPhoneClean.length > 5 && (dbPhoneClean.includes(phone) || phone.includes(dbPhoneClean))) {
            if (!foundOrders.some(o => o.id === docSnap.id)) {
              let pName = order.productName || order.productTitle || order.name || order.title || order.item || '';
              let pImg = order.imageUrl || order.image || order.img || order.productImage || order.photo || '';
              const pDate = order.date || order.orderDate || order.time || 'তারিখ নেই';
              const pPrice = order.price || order.productPrice || order.amount || 0;
              const cName = order.customerName || order.custName || order.name || 'গ্রাহক';
              const cPhone = order.phone || order.custPhone || order.customerPhone || order.mobile || '';
              const statusText = order.status || 'Pending';

              // যদি প্রোডাক্টের নাম বা ছবি না থাকে তবে প্রোডাক্ট কালেকশন থেকে ফেচ করা
              if ((!pName || !pImg || pName === 'N/A') && order.productId) {
                try {
                  const prodRef = doc(db, "products", order.productId);
                  const prodSnap = await getDoc(prodRef);
                  if (prodSnap.exists()) {
                    const prodData = prodSnap.data();
                    if (!pName || pName === 'N/A') pName = prodData.title || prodData.name || prodData.productName || 'Product';
                    if (!pImg) {
                      pImg = (prodData.imageUrls && prodData.imageUrls.length > 0) 
                             ? prodData.imageUrls[0] 
                             : (prodData.imageUrl || prodData.image || prodData.img || '');
                    }
                  }
                } catch(e) { console.log("Product fetch error:", e); }
              }

              foundOrders.push({
                id: docSnap.id,
                productName: !pName || pName === 'N/A' ? "AYAAT SPORT ITEM" : pName,
                imageUrl: !pImg ? "https://via.placeholder.com/70" : pImg,
                date: pDate,
                price: pPrice,
                customerName: cName,
                customerPhone: cPhone,
                status: statusText,
                statusClass: getStatusClass(statusText)
              });
            }
          }
        }
      }

      setOrders(foundOrders);
      if (foundOrders.length === 0) {
        setStatusMessage('আপনার সংরক্ষিত নম্বরগুলোতে কোনো অর্ডার পাওয়া যায়নি!');
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setStatusMessage('অর্ডার লোড করার সময় সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // নম্বর পরিবর্তন হ্যান্ডলার
  const handleChangePhone = () => {
    let currentMain = localStorage.getItem("userPhone") || "";
    const newNum = prompt("আপনার অর্ডার করা মোবাইল নম্বরটি লিখুন:", currentMain);
    if (newNum && newNum.trim() !== "") {
      fetchUserOrders(newNum);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 px-4 font-sans">
      
      <div className="max-w-[500px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-4 border border-slate-100">
          <Link href="/profile" className="no-underline text-slate-700 text-lg font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition">
            ←
          </Link>
          <h2 className="text-[16px] text-slate-800 font-extrabold m-0">📦 My Orders</h2>
          <button 
            onClick={handleChangePhone}
            className="text-[12px] text-[#d9363e] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border-none cursor-pointer font-bold transition"
          >
            নম্বর পরিবর্তন
          </button>
        </div>

        {/* Orders List Container */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 text-[14px] font-medium">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              অর্ডারগুলো খোঁজা হচ্ছে...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-600 bg-white rounded-2xl shadow-sm border border-slate-100 text-[14px]">
              <span className="text-3xl block mb-2">📭</span>
              <p className="font-semibold mb-3">{statusMessage}</p>
              <button 
                onClick={handleChangePhone}
                className="bg-[#d9363e] hover:bg-[#b52b32] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition"
              >
                অন্য নম্বর দিয়ে সার্চ করুন
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100 border-l-[6px] border-l-[#d9363e] flex gap-3.5 items-center transition hover:shadow-md"
              >
                <img 
                  src={order.imageUrl} 
                  alt="Product" 
                  className="w-[75px] h-[75px] object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1 text-[12px]">
                    <span className="text-slate-400 font-semibold">ID: #{order.id.slice(0, 6)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="text-[13px] text-slate-800 font-bold mb-1 truncate">
                    {order.productName}
                  </div>

                  <div className="text-[11px] text-slate-500 mb-0.5 flex justify-between">
                    <span>তারিখ: {order.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-1.5 flex justify-between">
                    <span>গ্রাহক: {order.customerName}</span>
                  </div>

                  <div className="font-bold text-[#d9363e] text-[13px] pt-1.5 border-t border-dashed border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 text-[11px]">সর্বমোট মূল্য:</span>
                    <span className="text-[#d9363e] text-[14px] font-extrabold">৳ {order.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
