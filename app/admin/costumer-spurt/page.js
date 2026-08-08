'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function CustomerSupport() {
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [chatListLoading, setChatListLoading] = useState(true);

  // ১. রিয়েল-টাইমে চ্যাট লিস্ট লোড করার জন্য
  useEffect(() => {
    const chatsRef = collection(db, "chats");
    const unsubscribeChats = onSnapshot(chatsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setChatList(list);
      setChatListLoading(false);
    }, (err) => {
      console.error("Error loading chat list:", err);
      setChatListLoading(false);
    });

    return () => unsubscribeChats();
  }, []);

  // ২. নির্দিষ্ট চ্যাট সিলেক্ট করলে মেসেজগুলো রিয়েল-টাইমে লোড করা
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(collection(db, "chats", activeChatId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMessages(msgs);
    }, (err) => {
      console.error("Error loading messages:", err);
    });

    return () => unsubscribeMessages();
  }, [activeChatId]);

  // ৩. অ্যাডমিন থেকে মেসেজ পাঠানোর ফাংশন
  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    const text = adminReplyText.trim();
    if (!text || !activeChatId) return;

    try {
      await addDoc(collection(db, "chats", activeChatId, "messages"), {
        text: text,
        sender: 'admin',
        timestamp: serverTimestamp()
      });
      setAdminReplyText('');
    } catch (err) {
      console.error("Error sending admin reply:", err);
      alert("⚠️ মেসেজ পাঠানো যায়নি!");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 md:px-8 font-sans">

      {/* Header Banner */}
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-indigo-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
          <p className="text-indigo-200 text-xs mt-1">কাস্টমার লাইভ চ্যাট সাপোর্ট (Admin Inbox)</p>
        </div>
        <Link href="/admin/control-room" className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer no-underline">
          <span>⚙️ কন্ট্রোল রুম</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
        
        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 shadow-sm">
          <h3 className="text-lg font-bold text-indigo-900 mb-1 flex items-center gap-2">
            💬 কাস্টমার চ্যাট লিস্ট ও লাইভ মেসেজ
          </h3>
          <p className="text-xs text-indigo-700 mb-4">কাস্টমারদের চ্যাট সিলেক্ট করে সরাসরি কথা বলুন:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[450px]">
            
            {/* Customer List Sidebar */}
            <div className="bg-white border border-indigo-100 rounded-xl p-3 overflow-y-auto flex flex-col gap-2">
              {chatListLoading ? (
                <p className="text-xs text-slate-400 text-center py-4">চ্যাট লিস্ট লোড হচ্ছে...</p>
              ) : chatList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">কোনো চ্যাট পাওয়া যায়নি।</p>
              ) : (
                chatList.map((chat) => {
                  const isSelected = activeChatId === chat.id;
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)} 
                      className={`p-2.5 rounded-lg border transition flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-100 border-indigo-400' : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'}`}
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-800">👤 কাস্টমার</p>
                        <p className="text-[11px] text-indigo-600 font-semibold">{chat.id}</p>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">Open</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Active Chat Area */}
            <div className="md:col-span-2 bg-white border border-indigo-100 rounded-xl p-4 flex flex-col justify-between">
              
              {!activeChatId ? (
                <div className="text-center text-slate-400 my-auto text-xs">
                  👈 বাঁ পাশ থেকে যেকোনো কাস্টমারের চ্যাট সিলেক্ট করুন
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  {/* Chat Top Bar */}
                  <div className="border-b pb-2 mb-2 flex justify-between items-center">
                    <h4 className="font-bold text-xs text-indigo-900">Chat with: {activeChatId}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live</span>
                  </div>

                  {/* Messages Box */}
                  <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-lg border text-xs flex flex-col">
                    {messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-xs ${isCustomer ? 'bg-slate-200 text-slate-800' : 'bg-indigo-600 text-white'}`}>
                            <p>{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5">{isCustomer ? 'Customer' : 'Admin'}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendAdminMessage} className="flex gap-2 mt-3">
                    <input 
                      type="text" 
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="অ্যাডমিন উত্তর লিখুন..." 
                      required 
                      autoComplete="off"
                      className="flex-1 border border-slate-300 p-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer">
                      Send
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
