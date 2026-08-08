'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ১. মূল পেজ কম্পোনেন্ট যা Suspense বাউন্ডারি দিয়ে র‍্যাপ করা
export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">লোডিং হচ্ছে...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

// ২. মূল লজিক এবং ইউজার ইন্টারফেস সমৃদ্ধ সাব-কম্পোনেন্ট
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Registration Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitBtnText, setSubmitBtnText] = useState('Register');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Dashboard State
  const [user, setUser] = useState(null);

  // Check LocalStorage and URL referral on load
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referred_by', refCode);
    }

    const localUser = JSON.parse(localStorage.getItem('ayaat_user'));
    if (localUser) {
      setUser(localUser);
    }
  }, [searchParams]);

  // Handle Profile Image Selection (Base64 conversion for LocalStorage)
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPreviewImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Register / Save Manual User to LocalStorage
  const handleRegister = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitBtnText('Saving Data...');

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    let photoUrl = previewImage;

    if (!photoUrl) {
      photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    }

    const autoPromo = 'AYAAT' + Math.floor(100000 + Math.random() * 900000);
    const userId = 'user_' + manualPhone.trim();
    const referredBy = localStorage.getItem('referred_by') || 'Direct';

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      phone: manualPhone.trim(),
      address: manualAddress.trim(),
      photo: photoUrl,
      promo: autoPromo,
      points: 50,
      referrals: 0,
      referredBy: referredBy,
      uid: userId
    };

    try {
      localStorage.setItem('ayaat_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user:", error);
      alert('রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setSubmitBtnText('Register');
      setIsSubmitting(false);
    }
  };

  // Logout Account
  const handleLogout = () => {
    localStorage.removeItem('ayaat_user');
    setUser(null);
    setFirstName('');
    setLastName('');
    setManualPhone('');
    setManualAddress('');
    setSelectedImageFile(null);
    setPreviewImage(null);
    setSubmitBtnText('Register');
    setIsSubmitting(false);
  };

  // Subpage Navigation Helper (Fixed .html extension issue)
  const openSubPage = (pageName) => {
    const route = pageName.replace('.html', '');
    router.push(`/${route}`);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-[50px] text-[#333] font-sans">
      <div className="max-w-[500px] mx-auto mt-[15px] px-[15px]">

        {/* REGISTRATION SECTION */}
        {!user ? (
          <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] relative">
            <form onSubmit={handleRegister}>
              
              {/* Top-Left Profile Circle */}
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

              {/* First Name & Last Name */}
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

              {/* Phone Number */}
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

              {/* Address Box */}
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

              {/* Register Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#e63946] hover:bg-[#c52a36] text-white border-none p-3 rounded-[12px] font-bold text-[14px] cursor-pointer transition mt-[5px] disabled:opacity-50"
              >
                {submitBtnText}
              </button>
            </form>
          </div>
        ) : (
          /* DASHBOARD SECTION */
          <div className="bg-white rounded-[16px] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] text-left">
            
            <div className="bg-[#fff5f5] border border-dashed border-[#e63946] rounded-[12px] p-[15px] text-center mb-5">
              <img src={user.photo} alt="Profile" className="w-[70px] h-[70px] rounded-full object-cover border-2 border-[#e63946] mx-auto mb-2" />
              <h3 className="text-[16px] text-[#e63946] mb-1 font-bold">স্বাগতম, {user.name}!</h3>
              <p className="text-[13px] text-[#555] mb-0.5">ফোন: {user.phone}</p>
              <p className="text-[13px] text-[#555] mb-0.5">প্রোমো কোড: {user.promo}</p>
            </div>

            {/* OVERVIEW MENU */}
            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">Overview</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('my-orders.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📦</span> My orders</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-returns.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🔄</span> My returns</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-coupons.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🎟️</span> My coupons</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-questions.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>❓</span> My questions</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('coin-balance.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🪙</span> Coin balance</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            {/* ACCOUNT MENU */}
            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">Account</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('my-details.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>👤</span> My personal details</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('payment-methods.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>💳</span> My payment methods</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('my-address.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📍</span> My address</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('settings.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>⚙️</span> Settings</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            {/* MORE MENU */}
            <div className="text-[14px] font-bold text-[#888] mt-5 mb-2 ml-1 uppercase">More</div>
            <div className="bg-[#f8f9fa] rounded-[12px] border border-[#eaeaea] overflow-hidden mb-4">
              <div onClick={() => openSubPage('shop-plus.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>⭐</span> Ayaat sports shop plus</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('shop-assistant.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🤖</span> Ayaat sports shop assistant</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('help.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🛟</span> Help</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('about-us.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>ℹ️</span> About us</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('privacy.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📜</span> Privacy Policy</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('terms.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium border-b border-[#eaeaea] bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>📜</span> Terms & Conditions</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
              <div onClick={() => openSubPage('add-product.html')} className="flex items-center justify-between p-[13px_15px] text-[#333] text-[14px] font-medium bg-white cursor-pointer hover:bg-[#f1f3f5] hover:text-[#e63946] transition">
                <div className="flex items-center gap-2.5"><span>🏷️</span> On sell you</div>
                <div className="text-[#aaa] text-[14px]">❯</div>
              </div>
            </div>

            <button onClick={handleLogout} className="block w-full bg-[#e63946] hover:bg-[#c52a36] text-white border-none p-3 rounded-[12px] font-bold text-[14px] cursor-pointer text-center transition mt-5">
              Logout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
