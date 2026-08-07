'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('অর্ডারগুলো খোঁজা হচ্ছে...');

  // স্ট্যাটাস ক্লাস নির্ধারণ করার ফাংশন
  const getStatusClass = (status) => {
    if (!status) return 'bg-[#fff3e0] text-[#f57c00]';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'bg-[#fff3e0] text-[#f57c00]';
    if (s.includes('packaging')) return 'bg-[#e3f2fd] text-[#1976d2]';
    if (s.includes('processing')) return 'bg-[#ede7f6] text-[#512da8]';
    if (s.includes('received')) return 'bg-[#e8f5e9] text-[#388e3c]';
    if (s.includes('delivery') || s.includes('delivered')) return 'bg-[#e0f2f1] text-[#00796b]';
    if (s.includes('cancel')) return 'bg-[#ffebee] text-[#c62828]';
    return 'bg-[#fff3e0] text-[#f57c00]';
  };

  // অর্ডার ফেচ করার ফাংশন
  const fetchUserOrders = useCallback(async (customPhone = null) => {
    setLoading(true);
    setStatusMessage('অর্ডারগুলো খোঁজা হচ্ছে...');

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
        setStatusMessage('নম্বর পাওয়া যায়নি। দয়া করে ওপরের নম্বর পরিবর্তন এ ক্লিক করে আপনার নম্বর দিন।');
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
    const newNum = prompt("আপনার অর্ডার করা মোবাইল নম্বরটি লিখুন (একাধিক নম্বর কমা দিয়ে বা আলাদাভাবে দেখতে নতুন নম্বর দিন):", currentMain);
    if (newNum && newNum.trim() !== "") {
      fetchUserOrders(newNum);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen p-[15px] font-sans">
      <div className="max-w-[500px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-[15px] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[15px]">
          <Link href="/profile" className="no-underline text-[#333] text-[18px] font-bold">←</Link>
          <h2 className="text-[16px] text-[#333] font-bold m-0">My Orders</h2>
          <button 
            onClick={handleChangePhone}
            className="text-[12px] text-[#007bff] bg-transparent border-none cursor-pointer underline font-bold"
          >
            নম্বর পরিবর্তন
          </button>
        </div>

        {/* Orders List Container */}
        <div>
          {loading ? (
            <div className="text-center p-[40px] text-[#777] bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[14px]">
              অর্ডারগুলো খোঁজা হচ্ছে...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-[40px] text-[#777] bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[14px]">
              {statusMessage}<br/><br/>
              <button 
                onClick={handleChangePhone}
                className="text-[#007bff] bg-transparent border-none cursor-pointer font-bold underline text-[13px]"
              >
                অন্য নম্বর দিয়ে সার্চ করুন
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white p-4 rounded-[12px] shadow-[0_3px_10px_rgba(0,0,0,0.06)] mb-3.5 border-l-[5px] border-[#d9363e] flex gap-3 items-center"
              >
                <img src={order.imageUrl} alt="Product" className="w-[70px] h-[70px] object-cover rounded-[8px] bg-[#eee] shrink-0" />
                <div className="grow">
                  <div className="flex justify-between items-center mb-1.5 text-[13px] font-bold">
                    <span className="text-[#555]">ID: #{order.id.slice(0, 6)}</span>
                    <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-bold uppercase ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#555] mb-0.5 flex justify-between">
                    <span>প্রোডাক্ট: <b className="text-black">{order.productName}</b></span>
                  </div>
                  <div className="text-[12px] text-[#555] mb-0.5 flex justify-between">
                    <span>তারিখ: {order.date}</span>
                  </div>
                  <div className="text-[12px] text-[#555] mb-0.5 flex justify-between">
                    <span>গ্রাহক: {order.customerName} ({order.customerPhone})</span>
                  </div>
                  <div className="font-bold text-[#d9363e] text-[14px] mt-1.5 border-t border-dashed border-[#eee] pt-1.5 flex justify-between items-center">
                    <span>মূল্য:</span>
                    <span className="text-[#d9363e] text-[15px]">{order.price} SAR</span>
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
