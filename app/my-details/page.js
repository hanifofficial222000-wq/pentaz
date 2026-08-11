'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function MyDetailsPage() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const savedUserKey = localStorage.getItem('ayaat_user_phone');
      if (savedUserKey) {
        try {
          const docRef = doc(db, 'users', savedUserKey);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setEmail(data.email || '');
            
            // ফোন নম্বর ও কান্ট্রি কোড আলাদা করার লজিক
            if (data.phone && data.phone.includes(' ')) {
              const parts = data.phone.split(' ');
              setCountryCode(parts[0]);
              setPhone(parts.slice(1).join(' '));
            } else {
              setPhone(data.phone || '');
            }

            setAddress(data.address || '');
            setBio(data.bio || '');
            setPreviewImage(data.photo || '');
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // প্রোফাইল ছবি পরিবর্তনের জন্য Choose File হ্যান্ডলার
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const savedUserKey = localStorage.getItem('ayaat_user_phone');
    if (!savedUserKey) {
      alert('ইউজার সেশন পাওয়া যায়নি। দয়া করে আবার লগইন করুন।');
      router.push('/dashboard');
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const fullPhone = `${countryCode} ${phone.trim()}`;

      const docRef = doc(db, 'users', savedUserKey);
      
      // ডেটাবেজে আপডেট করা
      await updateDoc(docRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        phone: fullPhone,
        address: address.trim(),
        bio: bio.trim(),
        photo: previewImage,
      });

      alert('আপনার প্রফাইল সফলভাবে আপডেট করা হয়েছে!');
      router.push('/dashboard'); // আপডেট শেষে ড্যাশবোর্ডে ফিরিয়ে নিয়ে যাবে
    } catch (error) {
      console.error("Update Error:", error);
      alert('আপডেট করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">
        
        {/* হেডার অংশ */}
        <div className="flex items-center mb-5 bg-white p-4 rounded-[12px] shadow-sm border border-[#eee]">
          <button onClick={() => router.back()} className="text-[18px] mr-3 bg-transparent border-none cursor-pointer">
            ←
          </button>
          <h2 className="text-[16px] font-bold text-[#333] m-0">My personal details</h2>
        </div>

        {/* ফর্ম অংশ */}
        <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee]">
          <form onSubmit={handleUpdate}>
            
            {/* প্রোফাইল ছবি ও Choose File সিস্টেম */}
            <div className="text-left mb-[20px]">
              <label className="text-[13px] font-bold block mb-[8px] text-[#333]">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-full bg-[#f1f3f5] border border-[#ddd] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-[#888]">ছবি</span>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfileImageChange}
                  className="w-full text-[13px] text-[#555] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-[13px] file:font-bold file:bg-[#e63946] file:text-white hover:file:bg-[#c52a36] cursor-pointer" 
                />
              </div>
            </div>

            <div className="text-left mb-[15px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">First name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="First name" 
                required 
                className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
              />
            </div>

            <div className="text-left mb-[15px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Last name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                placeholder="Last name" 
                required 
                className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
              />
            </div>

            <div className="text-left mb-[15px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Email (غير قابلة للتغيير)</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="w-full p-[11px] border border-[#eee] rounded-[10px] text-[14px] outline-none bg-[#f1f3f5] text-[#888] cursor-not-allowed"
              />
            </div>

            {/* কান্ট্রি কোড এবং মোবাইল ফোন */}
            <div className="text-left mb-[15px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Mobile phone</label>
              <div className="flex gap-2">
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946]"
                >
                  <option value="+966">+966 (KSA)</option>
                  <option value="+880">+880 (BD)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+1">+1 (USA)</option>
                </select>

                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Mobile phone" 
                  required 
                  className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
                />
              </div>
            </div>

            {/* মোবাইল নম্বর বক্সের ঠিক নিচে অ্যাড্রেস (Address) ইনপুট বক্স */}
            <div className="text-left mb-[15px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                rows="2" 
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন..." 
                required 
                className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
              ></textarea>
            </div>

            <div className="text-left mb-[20px]">
              <label className="text-[13px] font-bold block mb-[5px] text-[#333]">Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows="3" 
                placeholder="আপনার সম্পর্কে কিছু লিখুন..." 
                className="w-full p-[11px] border border-[#ddd] rounded-[10px] text-[14px] outline-none bg-[#fafafa] text-black focus:border-[#e63946] focus:bg-white transition"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full bg-[#888] hover:bg-[#666] text-white border-none p-3.5 rounded-[12px] font-bold text-[15px] cursor-pointer transition disabled:opacity-50"
            >
              {isUpdating ? 'আপডেট হচ্ছে...' : 'Update'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
