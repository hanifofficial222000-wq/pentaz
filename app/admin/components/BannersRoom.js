'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function BannersRoom() {
  const [topBannerText, setTopBannerText] = useState('');
  const [popupBannerImage, setPopupBannerImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Popup Banner File select kore Base64-e convert korar function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      alert("Please select an image smaller than 1MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPopupBannerImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase Firestore-e banners collection-er moddhe save kora hochche
      await setDoc(doc(db, "settings", "banners"), {
        topBannerText: topBannerText,
        popupBannerImage: popupBannerImage,
        updatedAt: new Date()
      });
      alert("Banners Updated Successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white p-4 md:p-6 rounded-lg shadow border mx-auto">
      <h1 className="text-lg md:text-xl font-bold mb-4 text-slate-800">Banner & Popup Ads Room</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Top Banner Notice / Text</label>
          <input 
            type="text" 
            value={topBannerText} 
            onChange={(e) => setTopBannerText(e.target.value)} 
            placeholder="e.g. Free Delivery on orders over 500৳!" 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Select Popup Banner / Ad Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="w-full p-2 border rounded text-sm bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
          />
          {popupBannerImage && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={popupBannerImage} alt="Popup Preview" className="w-16 h-12 object-cover rounded border" />
              <span className="text-xs text-green-600 font-medium">Banner Image Ready!</span>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white p-3 rounded text-sm font-bold"
        >
          {loading ? "Updating..." : "Update Banners"}
        </button>
      </form>
    </div>
  );
}
