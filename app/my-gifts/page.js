
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // firebase.js থেকে db ইমপোর্ট করা হলো
import { collection, getDocs } from 'firebase/firestore';

export default function MyGiftsPage() {
  const router = useRouter();
  
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('আপনার ৩০টি শেয়ার সম্পন্ন হলে নিচের পণ্যগুলো থেকে ফ্রি গিফট ক্লাম করতে পারবেন.');

  useEffect(() => {
    async function loadControlRoomGifts() {
      try {
        const querySnapshot = await getDocs(collection(db, "gifts"));
        const giftList = [];

        querySnapshot.forEach((docSnap) => {
          giftList.push({ id: docSnap.id, ...docSnap.data() });
        });

        setGifts(giftList);
        if (giftList.length > 0) {
          setStatusText('আপনার টার্গেট পূরণ হয়েছে! নিচের পণ্যগুলো থেকে ফ্রি গিফট ক্লাম করতে পারবেন.');
        } else {
          setStatusText('বর্তমানে কোনো গিফট অফার চালু নেই।');
        }
      } catch (error) {
        console.error("Error loading gifts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadControlRoomGifts();
  }, []);

  const claimGiftItem = (title) => {
    alert(`অভিনন্দন! আপনার "${title}" গিফট রিকোয়েস্ট সফলভাবে গ্রহণ করা হয়েছে।`);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-[90px] font-sans">
      
      {/* TOP HEADER */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200">
        <div className="text-base font-bold text-[#e63946]">🎁 My Gifts</div>
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="bg-[#e63946] text-white text-xs font-bold px-3 py-1.5 rounded-lg no-underline"
          >
            হোম পেজ
          </Link>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-md mx-auto px-4 mt-[15px]">
        
        {/* গিফট স্ট্যাটাস ব্যানার */}
        <div className="mb-[15px]">
          <div className="h-[120px] bg-gradient-to-br from-[#e63946] to-[#d62839] flex flex-col justify-center items-center text-white text-center p-4 rounded-xl shadow-md">
            <h3 className="text-base mb-1 font-bold">স্পেশাল অ্যাওয়ার্ড ও গিফট অফার!</h3>
            <p className="text-xs opacity-90">{statusText}</p>
          </div>
        </div>

        {/* গিফট প্রোডাক্ট সেকশন */}
        <div className="text-sm font-bold text-slate-800 mb-3 px-1">আপনার ফ্রি গিফট লিস্ট</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-[30px] text-slate-500 text-xs">গিফট লোড হচ্ছে...</div>
          ) : gifts.length === 0 ? (
            <div className="col-span-full text-center py-[30px] text-[#666] text-xs bg-white rounded-xl border border-slate-200">
              কন্ট্রোল রুম থেকে এখনো কোনো গিফট যুক্ত করা হয়নি!
            </div>
          ) : (
            gifts.map((item, index) => {
              const imgUrl = item.imageUrl || item.image || 'https://via.placeholder.com/300x200';
              const title = item.title || item.name || 'Gift Product';
              const price = item.price || 0;
              const offerType = item.offerType || 'FREE';

              return (
                <div 
                  key={item.id}
                  onClick={() => router.push(`/product?id=${item.id}`)}
                  className="bg-white rounded-[10px] overflow-hidden shadow-[0_2px_5px_rgba(0,0,0,0.1)] pb-2.5 cursor-pointer border border-slate-100"
                >
                  <div className="relative h-[150px]">
                    <span className="absolute top-2 left-2 bg-[#e63946] text-white px-2 py-0.5 text-[10px] font-bold rounded z-10">
                      {offerType}
                    </span>
                    <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] text-slate-400">GIFT #{index + 1}</span>
                    <h3 className="text-sm my-1 text-slate-800 font-bold truncate">{title}</h3>
                    <div className="text-[13px] text-[#e63946] font-bold">৳{price}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        claimGiftItem(title);
                      }}
                      className="w-full mt-2 py-2 bg-[#e63946] hover:bg-[#d62839] text-white border-none rounded-[5px] font-bold text-xs cursor-pointer text-center transition"
                    >
                      গিফট নিন
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center py-2 z-[1000]">
        <Link href="/" className="flex flex-col items-center no-underline text-slate-600 text-[11px] font-bold">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          হোম
        </Link>
        <Link href="/my-gifts" className="flex flex-col items-center no-underline text-[#e63946] text-[11px] font-bold">
          <svg className="w-[22px] h-[22px] mb-1 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
          গিফটস
        </Link>
      </nav>

      {/* WHATSAPP FLOAT */}
      <a 
        href="https://wa.me/8801835302525" 
        className="fixed bottom-16 right-5 bg-[#25D366] text-white w-[45px] h-[45px] rounded-full flex items-center justify-center text-[22px] no-underline shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[1000]" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        💬
      </a>

    </div>
  );
}
