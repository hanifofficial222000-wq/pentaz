'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function AdminSellersPage() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // পেন্ডিং সেলারদের ডেটা লোড করা
  const fetchPendingSellers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pending_sellers"));
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setPendingSellers(list);
    } catch (err) {
      console.error("Error fetching pending sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  // সেলার এপ্রুভ করার ফাংশন
  const handleApprove = async (seller) => {
    if (!confirm(`আপনি কি "${seller.brandName}" সেলার অ্যাকাউন্টটি এপ্রুভ করতে চান?`)) return;

    try {
      // ১. approved_sellers কালেকশনে সেভ করা
      await setDoc(doc(db, "approved_sellers", seller.id), {
        ...seller,
        status: 'Approved',
        approvedAt: new Date()
      });

      // ২. pending_sellers থেকে ডিলিট করা
      await deleteDoc(doc(db, "pending_sellers", seller.id));

      alert("✅ সেলার সফলভাবে এপ্রুভ করা হয়েছে!");
      fetchPendingSellers();
    } catch (err) {
      console.error("Approval Error:", err);
      alert("এপ্রুভ করতে সমস্যা হয়েছে!");
    }
  };

  // সেলার রিজেক্ট বা ডিলিট করার ফাংশন
  const handleDelete = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই আবেদনটি ডিলিট বা রিজেক্ট করতে চান?")) return;

    try {
      await deleteDoc(doc(db, "pending_sellers", id));
      alert("❌ আবেদনটি মুছে ফেলা হয়েছে।");
      fetchPendingSellers();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  if (loading) return <div className="text-center py-10 text-xs font-bold">লোড হচ্ছে...</div>;

  return (
    <div className="bg-slate-100 min-h-screen p-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-base font-extrabold text-slate-800 mb-4 pb-2 border-b">
          🛡️ সেলার রেজিস্ট্রেশন এপ্রুভাল প্যানেল ({pendingSellers.length})
        </h2>

        {pendingSellers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">কোনো নতুন সেলার আবেদন নেই।</p>
        ) : (
          <div className="space-y-4">
            {pendingSellers.map((seller) => (
              <div key={seller.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col md:flex-row gap-4 items-start justify-between">
                
                {/* সেলার ইনফো */}
                <div className="flex gap-3 items-start">
                  <img src={seller.profileUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-red-600 flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <h3 className="font-extrabold text-slate-900 text-sm">{seller.brandName}</h3>
                    <p className="text-slate-600"><b>নাম:</b> {seller.firstName} {seller.lastName}</p>
                    <p className="text-slate-600"><b>ফোন:</b> {seller.number}</p>
                    <p className="text-slate-600"><b>জিমেইল:</b> {seller.gmail || 'N/A'}</p>
                    <p className="text-slate-600"><b>ঠিকানা:</b> {seller.address || 'N/A'}</p>
                    
                    {/* লাইসেন্স ও এনআইডি দেখার লিংক */}
                    <div className="flex gap-2 pt-1">
                      <a href={seller.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">📄 ট্রেড লাইসেন্স</a>
                      <span>|</span>
                      <a href={seller.nidUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">🆔 এনআইডি কার্ড</a>
                    </div>
                  </div>
                </div>

                {/* অ্যাকশন বাটন */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleApprove(seller)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => handleDelete(seller.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition"
                  >
                    ❌ Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
