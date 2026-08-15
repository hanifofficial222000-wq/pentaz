'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export default function ShopAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const chatBoxRef = useRef(null);

  // ১. ইউনিক কাস্টমার আইডি তৈরি বা লোকালস্টোরেজ থেকে ফেচ করা
  useEffect(() => {
    let id = localStorage.getItem('ayaat_customer_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('ayaat_customer_id', id);
    }
    setCustomerId(id);
  }, []);

  // ২. ফায়ারবেস থেকে রিয়েল-টাইমে মেসেজ ফেচ করা
  useEffect(() => {
    if (!customerId) return;

    const messagesRef = collection(db, "chats", customerId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error("Error loading customer messages:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [customerId]);

  // ৩. চ্যাট বক্সের স্ক্রল সবসময় নিচে অটো-স্ক্রল রাখা
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ৪. ফায়ারবেসে মেসেজ পাঠানোর ফাংশন
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !customerId) return;

    const customerEmail = localStorage.getItem('userEmail') || `${customerId}@ayaatshop.com`;

    try {
      await setDoc(doc(db, "chats", customerId), {
        customerEmail: customerEmail,
        lastMessage: text,
        updatedAt: serverTimestamp(),
        status: 'open'
      }, { merge: true });

      await addDoc(collection(db, "chats", customerId, "messages"), {
        text: text,
        sender: 'customer',
        customerEmail: customerEmail,
        timestamp: serverTimestamp()
      });

      setInputText('');
    } catch (err) {
      console.error("Error sending message:", err);
      alert("⚠️ মেসেজ পাঠানো যায়নি! ফায়ারবেস পারমিশন চেক করুন।");
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-['Arial',sans-serif]">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">
        
        {/* Card Container */}
        <div className="bg-white rounded-[16px] p-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] flex flex-col h-[80vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-[15px] border-b border-[#eee] pb-[12px]">
            <div>
              <h3 className="text-[18px] text-[#e63946] flex items-center gap-[6px] font-bold">
                🤖 Shop Assistant
              </h3>
              <p className="text-[10px] text-gray-400">ID: {customerId || 'Loading...'}</p>
            </div>
            <Link 
              href="/" 
              className="bg-[#f1f3f5] border-none py-[8px] px-[14px] rounded-[8px] font-bold cursor-pointer text-[13px] no-underline text-[#333] transition hover:bg-[#e2e6ea]"
            >
              Back
            </Link>
          </div>
          
          {/* Chat Box */}
          <div 
            ref={chatBoxRef} 
            className="flex-1 bg-[#f8f9fa] border border-[#e9ecef] rounded-[12px] p-[15px] overflow-y-auto flex flex-col gap-[10px] mb-[15px]"
          >
            {loading ? (
              <p className="text-center text-xs text-gray-400 my-auto">মেসেজ লোড হচ্ছে...</p>
            ) : messages.length === 0 ? (
              <div className="text-center text-xs text-gray-500 my-auto">
                <p className="font-bold text-gray-700 mb-1">আসসালামু আলাইকুম! 👋</p>
                <p>Ayaat Sport Shop-এ আপনাকে স্বাগতম। আপনার প্রশ্নটি নিচে লিখে পাঠান।</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[75%] p-[10px_14px] rounded-[12px] text-[13.5px] leading-[1.5] break-words ${
                    msg.sender === 'customer' 
                      ? 'bg-[#e63946] text-white self-end rounded-br-[2px]' 
                      : 'bg-[#e9ecef] text-[#333] self-start rounded-bl-[2px]'
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Chat Input Area */}
          <form onSubmit={handleSendMessage} className="flex gap-[8px]">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="এখানে আপনার মেসেজ লিখুন..." 
              autoComplete="off" 
              required 
              className="flex-1 p-[12px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
            />
            <button 
              type="submit" 
              className="bg-[#e63946] text-white border-none px-[20px] rounded-[10px] font-bold cursor-pointer transition hover:bg-[#c52a36]"
            >
              Send
            </button>
          </form>
    </div>
  );
}
