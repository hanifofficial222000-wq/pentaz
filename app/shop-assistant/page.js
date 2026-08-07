'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ShopAssistantPage() {
  const [messages, setMessages] = useState([
    { sender: 'admin', text: 'আসসালামু আলাইকুম! Ayaat Sport Shop-এ আপনাকে স্বাগতম। আপনার কি সাহায্য প্রয়োজন?' }
  ]);
  const [inputText, setInputText] = useState('');
  const chatBoxRef = useRef(null);

  // পেজ লোড হলে localStorage থেকে পূর্বের চ্যাট মেসেজগুলো লোড করা
  useEffect(() => {
    const savedMessages = localStorage.getItem('ayaat_chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Error parsing chat messages:", e);
      }
    }
  }, []);

  // চ্যাট বক্সের স্ক্রল সবসময় নিচে রাখার জন্য
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // মেসেজ পাঠানো এবং লোকালস্টোরেজে সেভ করার ফাংশন
  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newMessages = [
      ...messages, 
      { sender: 'customer', text: text }
    ];

    // অটো রিপ্লাই বা অ্যাসিস্ট্যান্ট রেসপন্স (ঐচ্ছিক)
    const autoReply = { 
      sender: 'admin', 
      text: 'আপনার মেসেজটি আমাদের কাছে পৌঁছেছে। খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।' 
    };

    const updatedWithReply = [...newMessages, autoReply];

    setMessages(updatedWithReply);
    localStorage.setItem('ayaat_chat_messages', JSON.stringify(updatedWithReply));
    setInputText('');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-['Arial',sans-serif]">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">
        
        {/* Card Container */}
        <div className="bg-white rounded-[16px] p-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] flex flex-col h-[80vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-[15px] border-b border-[#eee] pb-[12px]">
            <h3 className="text-[18px] text-[#e63946] flex items-center gap-[6px] font-bold">
              🤖 Shop Assistant
            </h3>
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
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[75%] p-[10px_14px] rounded-[12px] text-[13.5px] leading-[1.5] break-words ${
                  msg.sender === 'customer' 
                    ? 'bg-[#e63946] text-white self-end rounded-br-[2px]' 
                    : 'bg-[#e9ecef] text-[#333] self-start rounded-bl-[2px]'
                }`}
              >
                {msg.text}
              </div>
            ))}
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
              className="bg-[#e63946] color-white text-white border-none px-[20px] rounded-[10px] font-bold cursor-pointer transition hover:bg-[#c52a36]"
            >
              Send
            </button>
          </form>

        </div>
      </div>

      {/* WhatsApp Floating Icon */}
      <a 
        href="https://wa.me/8801835302525" 
        className="fixed bottom-[20px] right-[20px] bg-[#25D366] text-white w-[45px] h-[45px] rounded-full flex items-center justify-center text-[22px] no-underline shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[1000]" 
        target="_blank" 
        rel="noreferrer"
      >
        💬
      </a>

      {/* Footer */}
      <footer className="bg-[#2b2b2b] text-[#e5e5e5] p-[25px_15px] mt-[40px] text-center rounded-t-[12px] max-w-[500px] mx-auto">
        <h3 className="text-[#ff4d4d] mb-[12px] text-[18px] font-bold">AYAAT SPORT SHOP</h3>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>প্রতিষ্ঠাতা:</b> Md Hanif Cox</p>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>ঠিকানা:</b> মাইজপাড়া, কালারমারছড়া, মহেশখালী | বাংলাদেশ</p>
        <p className="text-[13px] leading-[1.9] my-[6px] text-[#cccccc]"><b>ফোন:</b> +8801835302525</p>
        <p className="mt-[15px] text-[12px] text-[#aaa]">© ২০২৬ AYAAT SPORT SHOP. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </div>
  );
}
