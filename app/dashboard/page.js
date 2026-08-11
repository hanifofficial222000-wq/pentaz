'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  deleteUser
} from 'firebase/auth';

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">লোডিং হচ্ছে...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // User Dashboard State
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Email/Password Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); // true = Login, false = Register

  // Registration Extra States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualBio, setManualBio] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referred_by', refCode);
    }

    const checkStoredUser = async () => {
      const savedUserKey = localStorage.getItem('ayaat_user_phone');
      if (savedUserKey) {
        try {
          const docRef = doc(db, 'users', savedUserKey);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data());
          } else {
            localStorage.removeItem('ayaat_user_phone');
          }
        } catch (error) {
          console.error("Error fetching user from Firebase:", error);
        }
      }
      setCheckingSession(false);
    };

    checkStoredUser();
  }, [searchParams]);

  // Profile Image Selection (Choose File System)
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPreviewImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Email / Password Authentication Handler (Login & Register)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let userCredential;
      const emailKey = email.replace(/[.#$[\]]/g, '_');

      if (isLoginMode) {
        // লগইন করার জন্য
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const docRef = doc(db, 'users', emailKey);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data());
          localStorage.setItem('ayaat_user_phone', emailKey);
        } else {
          // ডেটাবেজে প্রোফাইল না থাকলে অটোমেটিক তৈরি করে নেওয়া হবে
          const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
          const referredBy = localStorage.getItem('referred_by') || 'Direct';
          const authUser = userCredential.user;

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
            referredBy: referredBy,
            uid: authUser.uid,
            createdAt: new Date().toISOString()
          };

          await setDoc(docRef, newUserData);
          localStorage.setItem('ayaat_user_phone', emailKey);
          setUser(newUserData);
        }
      } else {
        // নতুন অ্যাকাউন্ট তৈরির জন্য
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        let photoUrl = previewImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
        const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
        const referredBy = localStorage.getItem('referred_by') || 'Direct';

        const userData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          phone: manualPhone.trim() || 'Not provided',
          email: email,
          address: manualAddress.trim() || 'Not provided',
          bio: manualBio.trim() || 'No bio added yet',
          photo: photoUrl,
          promo: autoPromo,
          points: 50,
          referrals: 0,
          referredBy: referredBy,
          uid: authUser.uid,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', emailKey), userData);
        localStorage.setItem('ayaat_user_phone', emailKey);
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert('সমস্যা হয়েছে: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      const emailKey = loggedUser.email.replace(/[.#$[\]]/g, '_');
      const docRef = doc(db, 'users', emailKey);
      const docSnap = await getDoc(docRef);

      let userData;
      if (docSnap.exists()) {
        userData = docSnap.data();
      } else {
        const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
        const referredBy = localStorage.getItem('referred_by') || 'Direct';
        const displayName = loggedUser.displayName || 'Google User';
        const nameParts = displayName.split(' ');
        
        userData = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          name: displayName,
          phone: loggedUser.phoneNumber || 'Not provided',
          email: loggedUser.email,
          address: 'Not provided',
          bio: 'No bio added yet',
          photo: loggedUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
          promo: autoPromo,
          points: 50,
          referrals: 0,
          referredBy: referredBy,
          uid: loggedUser.uid,
          createdAt: new Date().toISOString()
        };

        await setDoc(docRef, userData);
      }

      localStorage.setItem('ayaat_user_phone', emailKey);
      setUser(userData);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert('গুগল লগইন করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  // লগআউট করার ফাংশন
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
    localStorage.removeItem('ayaat_user_phone');
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // অ্যাকাউন্ট সম্পূর্ণ ডিলিট করার ফাংশন
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট ডিলিট করতে চান? এটি আর ফিরিয়ে আনা যাবে না।");
    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await deleteUser(currentUser);
      }
      
      const savedUserKey = localStorage.getItem('ayaat_user_phone');
      if (savedUserKey) {
        await deleteDoc(doc(db, 'users', savedUserKey));
      }

      localStorage.removeItem('ayaat_user_phone');
      setUser(null);
      setEmail('');
      setPassword('');
      alert("আপনার অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।");
      
    } catch (error) {
      console.error("Delete Account Error:", error);
      alert("অ্যাকাউন্ট ডিলিট করতে সমস্যা হয়েছে: " + error.message + "\n(নিরাপত্তার জন্য একবার লগআউট করে পুনরায় লগইন করে চেষ্টা করুন)");
    }
  };

  const openSubPage = (pageName) => {
    router.push(`/${pageName}`);
  };

  if (checkingSession) {
    return <div className="text-center py-20 text-xs text-slate-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">

        {/* LOGIN / REGISTRATION SECTION */}
        {!user ? (
          <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee]">
            
            <div className="text-center mb-6">
              <h2 className="text-[18px] font-bold text-[#e63946]">
                {isLoginMode ? 'AYAAT SHOP-এ লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </h2>
              <p className="text-[13px] text-[#666] mt-1">
                {isLoginMode ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন' : 'আপনার সঠিক তথ্য দিয়ে রেজিস্টার করুন'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth}>
              
              {!isLoginMode && (
                <>
                  <div className="flex justify-start mb-[15px]">
                    <div className="w-[65px] h-[65px] rounded-full bg-[#f1f3f5] border-2 border-dashed border-[#e63946] flex items-center justify-center overflow-hidden relative cursor-pointer">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-[#555] text-center">📷 ছবি</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfileImageChange}
                        className="absolute w-[65px] h-[65px] opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="text-left mb-[15px] flex-1">
                      <label className="text-[13px] font-bold block mb-[5px] text-[#333]">First Name:</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="প্রথম নাম" 
                        required 
                        className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                      />
                    </div>
                    <div className="text-left mb-[15px] flex-1">
                      <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Last Name:</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="শেষ নাম" 
                        required 
                        className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="text-left mb-[15px]">
                    <label className="text-[13px] font-bold block mb-[5px] text-[#333]">ফোন নম্বর:</label>
                    <input 
                      type="tel" 
                      value={manualPhone} 
                      onChange={(e) => setManualPhone(e.target.value)} 
                      placeholder="০১৮xxxxxxxx" 
                      required 
                      className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                    />
                  </div>

                  <div className="text-left mb-[15px]">
                    <label className="text-[13px] font-bold block mb-[5px] text-[#333]">ঠিকানা (Address):</label>
                    <textarea 
                      value={manualAddress} 
                      onChange={(e) => setManualAddress(e.target.value)} 
                      rows="2" 
                      placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন" 
                      required 
                      className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                    ></textarea>
                  </div>

                  <div className="text-left mb-[15px]">
                    <label className="text-[13px] font-bold block mb-[5px] text-[#333]">বায়ো (Bio):</label>
                    <input 
                      type="text" 
                      value={manualBio} 
                      onChange={(e) => setManualBio(e.target.value)} 
                      placeholder="আপনার সম্পর্কে কিছু বলুন" 
                      className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                    />
                  </div>
                </>
              )}

              <div className="text-left mb-[15px]">
                <label className="text-[13px] font-bold block mb-[5px] text-[#333]">ইমেইল:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="example@gmail.com" 
                  required 
                  className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                />
              </div>

              <div className="text-left mb-[15px]">
                <label className="text-[13px] font-bold block mb-[5px] text-[#333]">পাসওয়ার্ড:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড" 
                  required 
                  className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white border-none p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition mt-[5px] disabled:opacity-50"
              >
                {isSubmitting ? 'অপেক্ষা করুন...' : (isLoginMode ? 'লগইন করুন' : 'রেজিস্ট্রেশন সম্পন্ন করুন')}
              </button>
            </form>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-[13px] text-[#e63946] font-medium bg-transparent border-none cursor-pointer hover:underline"
              >
                {isLoginMode ? 'অ্যাকাউন্ট নেই? নতুন রেজিস্টার করুন' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'}
              </button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-[#ddd]"></div>
              <span className="px-3 text-xs text-[#778]">অথবা</span>
              <div className="flex-grow border-t border-[#ddd]"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-[#f1f3f5] text-[#333] border border-[#ddd] p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              গেমেইল (Google) দিয়ে লগইন করুন
            </button>

          </div>
        ) : (
          <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] text-left">
            
            {/* ইউজার ডিটেইলস কার্ড (Name, Number, Gmail, Address, Bio, Promo Code ফরম্যাট) */}
            <div className="bg-[#fff5f5] border border-dashed border-[#e63946] rounded-[12px] p-[18px] mb-5 text-center">
              <img src={user.photo} alt="Profile" className="w-[75px] h-[75px] rounded-full object-cover border-2 border-[#e63946] mx-auto mb-3 shadow-sm" />
              
              <div className="text-left space-y-1.5 text-[13px] text-[#333] bg-white p-3.5 rounded-[10px] border border-[#ffe3e3]">
                <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                <p><strong>Number:</strong> {user.phone || 'Not provided'}</p>
                <p><strong>Gmail:</strong> {user.email || 'Not provided'}</p>
                <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
                <p><strong>Bio:</strong> {user.bio || 'No bio added yet'}</p>
                <p><strong>Promo Code:</strong> <span className="text-[#e63946] font-bold">{user.promo}</span></p>
              </div>
            </div>

            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">Overview</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('my-orders')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📦</span> My orders</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('return-management')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🔄</span> Return-management</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-coupons')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🎟️</span> My coupons</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-questions')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>❓</span> My questions</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('coins-balance')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🪙</span> Coin balance</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">Account</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('my-details')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>👤</span> My personal details</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('payment-methods')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>💳</span> My payment methods</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-address')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📍</span> My address</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('settings')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>⚙️</span> Settings</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">More</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('shop-plus')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>⭐</span> shop plus PenTazz</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('shop-assistant')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🤖</span> assistant PenTazz</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('help')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🛟</span> Help</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('about')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>ℹ️</span> About us</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('privacy-policy')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📜</span> Privacy Policy</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('terms')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📜</span> Terms & Conditions</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('add-product')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🏷️</span> On sell PenTazz </div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button onClick={handleLogout} className="block w-full bg-[#333] hover:bg-[#111] text-white border-none p-3 rounded-[12px] font-bold text-[14px] cursor-pointer text-center transition shadow-sm">
                লগআউট করুন (Logout)
              </button>
              
              <button onClick={handleDeleteAccount} className="block w-full bg-white hover:bg-[#fff5f5] text-[#e63946] border border-[#e63946] p-3 rounded-[12px] font-bold text-[14px] cursor-pointer text-center transition">
                অ্যাকাউন্ট ডিলিট করুন (Delete Account)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
