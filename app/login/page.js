'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

export default function AuthPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // সাইন-আপের জন্য অতিরিক্ত স্টেট (First Name, Last Name, Phone, Bio)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailKey = email.replace(/[.#$[\]]/g, '_');
      const docRef = doc(db, 'users', emailKey);

      if (isLoginMode) {
        // লগইন প্রক্রিয়া
        await signInWithEmailAndPassword(auth, email, password);
        
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // যদি ডাটাবেজে প্রোফাইল না থাকে তবে অটো তৈরি করে নেবে
          const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
          const defaultName = email.split('@')[0];
          const newUserData = {
            firstName: defaultName,
            lastName: '',
            name: defaultName,
            phone: 'Not provided',
            email: email,
            address: 'Not provided',
            bio: 'No bio added yet',
            photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            promo: autoPromo,
            points: 50,
            referrals: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newUserData);
        }

        localStorage.setItem('ayaat_user_phone', emailKey);
        alert("সফলভাবে লগইন হয়েছে!");
      } else {
        // নতুন অ্যাকাউন্ট তৈরি (সাইন-আপ) প্রক্রিয়া
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const fullPhone = `${countryCode} ${phone.trim()}`;
        const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
        
        const userData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          phone: fullPhone,
          email: email,
          address: 'Not provided',
          bio: bio.trim() || 'No bio added yet',
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          promo: autoPromo,
          points: 50,
          referrals: 0,
          uid: authUser.uid,
          createdAt: new Date().toISOString()
        };

        await setDoc(docRef, userData);
        localStorage.setItem('ayaat_user_phone', emailKey);
        alert("সফলভাবে নতুন অ্যাকাউন্ট তৈরি হয়েছে!");
      }

      router.push('/dashboard'); 
    } catch (error) {
      alert("সমস্যা হয়েছে: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('ayaat_user_phone');
      alert("লগআউট সফল হয়েছে।");
    } catch (error) {
      alert("লগআউট করতে সমস্যা হয়েছে: " + error.message);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">লোড হচ্ছে...</div>;
  }

  if (user) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-[400px] w-full bg-white rounded-[16px] p-6 shadow-md border border-[#eee] text-center">
          <h2 className="text-[20px] font-bold text-[#e63946] mb-2">আপনি ইতিমধ্যে লগইন করা আছেন!</h2>
          <p className="text-[13px] text-gray-600 mb-6 break-all">ইমেইল: {user.email}</p>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition mb-3"
          >
            ড্যাশবোর্ডে যান
          </button>

          <button 
            onClick={handleLogout}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition"
          >
            লগআউট করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-[400px] w-full bg-white rounded-[16px] p-6 shadow-md border border-[#eee]">
        
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            type="button"
            onClick={() => setIsLoginMode(true)}
            className={`w-1/2 pb-2 text-[15px] font-bold cursor-pointer transition-all ${isLoginMode ? 'text-[#e63946] border-b-2 border-[#e63946]' : 'text-gray-400'}`}
          >
            লগইন
          </button>
          <button 
            type="button"
            onClick={() => setIsLoginMode(false)}
            className={`w-1/2 pb-2 text-[15px] font-bold cursor-pointer transition-all ${!isLoginMode ? 'text-[#e63946] border-b-2 border-[#e63946]' : 'text-gray-400'}`}
          >
            সাইন-আপ
          </button>
        </div>

        <h2 className="text-[18px] font-bold text-gray-800 text-center mb-4">
          {isLoginMode ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* সাইন-আপ মোডে অতিরিক্ত ফিল্ডগুলো দেখাবে */}
          {!isLoginMode && (
            <>
              <div className="mb-4">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">First name:</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  placeholder="First name" 
                  required 
                  className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                />
              </div>

              <div className="mb-4">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">Last name:</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  placeholder="Last name" 
                  required 
                  className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                />
              </div>

              <div className="mb-4">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">Mobile phone:</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                  >
                    <option value="+966">+966</option>
                    <option value="+880">+880</option>
                    <option value="+971">+971</option>
                    <option value="+1">+1</option>
                  </select>

                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Mobile phone" 
                    required 
                    className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[13px] font-bold block mb-1 text-[#333]">Bio:</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows="2" 
                  placeholder="আপনার সম্পর্কে কিছু লিখুন..." 
                  className="w-full p-3 border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                ></textarea>
              </div>
            </>
          )}

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
            disabled={loading}
            className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition disabled:opacity-50"
          >
            {loading ? 'দাঁড়ান...' : (isLoginMode ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-[13px] text-gray-600">
            {isLoginMode ? "একাউন্ট নেই?" : "ইতিমধ্যেই একাউন্ট আছে?"}{' '}
            <button 
              type="button" 
              onClick={() => setIsLoginMode(!isLoginMode)} 
              className="text-[#e63946] font-bold cursor-pointer hover:underline bg-transparent border-none p-0 text-[13px]"
            >
              {isLoginMode ? 'এখানে সাইন-আপ করুন' : 'এখানে লগইন করুন'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
