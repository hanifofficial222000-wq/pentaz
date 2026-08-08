'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function UserShareManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('ইউজারদের ডেটা লোড হচ্ছে...');

  // ইউজারদের ডেটা ফেচ করা
  useEffect(() => {
    async function loadUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users")); 

        if (querySnapshot.empty) {
          setLoadingText('কোনো রেজিস্টার্ড ইউজার পাওয়া যায়নি!');
          setLoading(false);
          return;
        }

        const userList = [];
        querySnapshot.forEach((docSnap) => {
          const user = docSnap.data();
          userList.push({
            id: docSnap.id,
            name: user.name || user.email || user.phone || 'অজানা ইউজার',
            phone: user.phone || '',
            shareCount: user.shareCount || 0,
            giftProduct1: user.giftProduct1 || '',
            giftProduct2: user.giftProduct2 || '',
            giftProduct3: user.giftProduct3 || '',
          });
        });

        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoadingText('ডেটা লোড করতে সমস্যা হয়েছে!');
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // ইনপুট ভ্যালু পরিবর্তন হ্যান্ডেল করা
  const handleGiftChange = (userId, field, value) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, [field]: value } : user
      )
    );
  };

  // ইউজারের গিফট প্রোডাক্ট সেভ করা
  const saveUserGifts = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        giftProduct1: user.giftProduct1.trim(),
        giftProduct2: user.giftProduct2.trim(),
        giftProduct3: user.giftProduct3.trim()
      });
      alert('সফলভাবে ইউজারের ৩টি গিফট প্রোডাক্ট আপডেট করা হয়েছে!');
    } catch (err) {
      console.error(err);
      alert('গিফট সেভ করতে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen text-[#333] p-5 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-5">
          <h2 className="text-[#e63946] text-lg font-bold">🎁 ইউজার শেয়ার ও ৩টি গিফট প্রোডাক্ট ম্যানেজমেন্ট</h2>
          <Link href="/admin" className="bg-[#6c757d] text-white py-2 px-4 rounded-md no-underline text-[13px] font-bold">
            ⬅️ ড্যাশবোর্ড
          </Link>
        </header>

        <div className="bg-white p-5 rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center p-[30px] text-[#666] font-bold">{loadingText}</div>
          ) : users.length === 0 ? (
            <div className="text-center p-[30px] text-[#666] font-bold">{loadingText}</div>
          ) : (
            <table className="w-full border-collapse mt-2.5 text-left">
              <thead>
                <tr>
                  <th className="p-3 border-b border-[#eee] bg-[#f8f9fa] text-[#495057] font-bold text-[13px]">ইউজার ইনফো</th>
                  <th className="p-3 border-b border-[#eee] bg-[#f8f9fa] text-[#495057] font-bold text-[13px]">UID / আইডি</th>
                  <th className="p-3 border-b border-[#eee] bg-[#f8f9fa] text-[#495057] font-bold text-[13px]">সফল শেয়ার</th>
                  <th className="p-3 border-b border-[#eee] bg-[#f8f9fa] text-[#495057] font-bold text-[13px]">গিফট প্রোডাক্ট ৩টি (নাম বা আইডি দিন)</th>
                  <th className="p-3 border-b border-[#eee] bg-[#f8f9fa] text-[#495057] font-bold text-[13px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const targetReached = user.shareCount >= 30;
                  return (
                    <tr key={user.id}>
                      <td className="p-3 border-b border-[#eee] text-[13px] align-middle text-black">
                        <span className="font-bold">{user.name}</span><br />
                        <span className="text-[#777] text-xs">{user.phone}</span>
                      </td>
                      <td className="p-3 border-b border-[#eee] text-[13px] align-middle text-black">
                        <code className="bg-gray-100 p-1 rounded text-xs">{user.id}</code>
                      </td>
                      <td className="p-3 border-b border-[#eee] text-[13px] align-middle">
                        <span className="bg-[#e3f2fd] text-[#0d47a1] py-1 px-2 rounded font-bold inline-block text-xs">
                          {user.shareCount} টি শেয়ার
                        </span><br />
                        {targetReached ? (
                          <span className="bg-[#d4edda] text-[#155724] py-0.5 px-1.5 rounded text-[11px] font-bold mt-1 inline-block">
                            ✅ টার্গেট পূর্ণ (৩০+)
                          </span>
                        ) : (
                          <span className="text-[#e63946] text-[11px] font-bold mt-1 block">
                            ⚠️ টার্গেট বাকি আছে
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b border-[#eee] text-[13px] align-middle">
                        <input 
                          type="text" 
                          value={user.giftProduct1} 
                          onChange={(e) => handleGiftChange(user.id, 'giftProduct1', e.target.value)}
                          placeholder="গিফট প্রোডাক্ট ১" 
                          className="p-1.5 border border-[#ccc] rounded text-xs w-full mb-1 text-black outline-none focus:border-[#e63946]"
                        />
                        <input 
                          type="text" 
                          value={user.giftProduct2} 
                          onChange={(e) => handleGiftChange(user.id, 'giftProduct2', e.target.value)}
                          placeholder="গিফট প্রোডাক্ট ২" 
                          className="p-1.5 border border-[#ccc] rounded text-xs w-full mb-1 text-black outline-none focus:border-[#e63946]"
                        />
                        <input 
                          type="text" 
                          value={user.giftProduct3} 
                          onChange={(e) => handleGiftChange(user.id, 'giftProduct3', e.target.value)}
                          placeholder="গিফট প্রোডাক্ট ৩" 
                          className="p-1.5 border border-[#ccc] rounded text-xs w-full text-black outline-none focus:border-[#e63946]"
                        />
                      </td>
                      <td className="p-3 border-b border-[#eee] text-[13px] align-middle">
                        <button 
                          onClick={() => saveUserGifts(user.id)}
                          className="bg-[#28a745] text-white border-none py-2 px-3 rounded cursor-pointer font-bold text-xs w-full hover:bg-[#218838] transition"
                        >
                          সেভ করুন
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
