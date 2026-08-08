'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '' });

  const showAlert = (msg) => {
    setAlert({ show: true, msg });
    setTimeout(() => setAlert({ show: false, msg: '' }), 4000);
  };

  // Load Website Orders
  const loadWebsiteOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(list);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsiteOrders();
  }, []);

  // Update Order Status
  const updateOrderStatus = async (docId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", docId), { status: newStatus });
      showAlert(`🎉 অর্ডার স্ট্যাটাস '${newStatus}' করা হয়েছে!`);
      loadWebsiteOrders();
    } catch (err) {
      alert("⚠️ স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!");
    }
  };

  // Delete Order
  const deleteOrder = async (docId) => {
    if (confirm("আপনি কি সত্যিই এই অর্ডারটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "orders", docId));
        showAlert("🗑️ অর্ডারটি ডিলিট করা হয়েছে!");
        loadWebsiteOrders();
      } catch (err) {
        alert("⚠️ ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">

      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-blue-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-blue-200 text-xs mt-1">ওয়েবসাইট অর্ডার ম্যানেজমেন্ট সিস্টেম</p>
        </div>
        <Link href="/admin/control-room" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer no-underline">
          <span>⚙️ কন্ট্রোল রুম</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        
        {/* Alert Box */}
        {alert.show && (
          <div className="p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
            {alert.msg}
          </div>
        )}

        {/* WEBSITE ORDERS MANAGEMENT */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2">
            📦 ওয়েবসাইট অর্ডারসমূহ (New Orders)
          </h3>
          <p className="text-xs text-blue-700 mb-4">কাস্টমারদের দেওয়া অর্ডারগুলো এখানে ম্যানেজ করুন:</p>

          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-400">অর্ডার লোড হচ্ছে...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-slate-500">কোনো নতুন অর্ডার নেই।</p>
            ) : (
              orders.map((order) => {
                let statusBg = 'bg-amber-100 text-amber-800';
                if (order.status === 'Processing') statusBg = 'bg-yellow-100 text-yellow-800';
                else if (order.status === 'Packing') statusBg = 'bg-blue-100 text-blue-800';
                else if (order.status === 'Tracking') statusBg = 'bg-purple-100 text-purple-800';
                else if (order.status === 'Delivered') statusBg = 'bg-green-100 text-green-700';

                let productImg = (order.imageUrls && order.imageUrls.length > 0) ? order.imageUrls[0] : (order.imageUrl || order.productImage || 'https://via.placeholder.com/50');
                let productPin = order.productPin || order.id.slice(0, 6).toUpperCase();

                return (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <img src={productImg} className="w-12 h-12 rounded-lg object-cover border" alt="Product" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{order.productTitle || 'Product'}</h4>
                          <p className="text-[11px] text-red-600 font-bold">দাম: SAR {order.productPrice} {order.size && order.size !== 'N/A' ? `| সাইজ: ${order.size}` : ''}</p>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${statusBg}`}>{order.status || 'Pending'}</span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border">
                      <p>📌 <b>প্রোডাক্ট পিন/আইডি:</b> <span className="text-blue-600 font-bold">#{productPin}</span></p>
                      <p>👤 <b>নাম:</b> {order.customerName}</p>
                      <p>📞 <b>ফোন:</b> <a href={`https://wa.me/${order.customerPhone}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">{order.customerPhone}</a></p>
                      <p>🏠 <b>ঠিকানা:</b> {order.customerAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      <button onClick={() => updateOrderStatus(order.id, 'Processing')} className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer text-center">⏳ Processing</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Packing')} className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer text-center">📦 Packing</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Tracking')} className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer text-center">🚚 Tracking</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer text-center">✔️ Delivered</button>
                    </div>
                    <button onClick={() => deleteOrder(order.id)} className="w-full bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold py-1.5 rounded-lg transition cursor-pointer text-center mt-1">🗑️ অর্ডার ডিলিট করুন</button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
