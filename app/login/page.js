'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); 
    } catch (error) {
      alert("লগইন ব্যর্থ হয়েছে: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-[400px] w-full bg-white rounded-[16px] p-6 shadow-md border border-[#eee]">
        <h2 className="text-[20px] font-bold text-[#e63946] text-center mb-6">AYAAT SHOP লগইন</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-[13px] font-bold block mb-1 text-[#333]">ইমেইল:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@gmail.com" 
              required 
              className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
            />
          </div>

          <div className="mb-4">
            <label className="text-[13px] font-bold block mb-1 text-[#333]">পাসওয়ার্ড:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="পাসওয়ার্ড দিন" 
              required 
              className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition disabled:opacity-50"
          >
            {isSubmitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
