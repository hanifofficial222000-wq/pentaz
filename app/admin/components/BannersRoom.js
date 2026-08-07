'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

export default function BannersRoom() {
  const [topBannerText, setTopBannerText] = useState('');
  const [middleBannerImage, setMiddleBannerImage] = useState('');
  const [middleBannerCategory, setMiddleBannerCategory] = useState('All');
  
  const [popupBannerImage, setPopupBannerImage] = useState('');
  const [popupBannerCategory, setPopupBannerCategory] = useState('All');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Categories fetch kora jate dropdown-e category link kora jay
  useEffect(() => {
    async function fetchCategoriesAndBanners() {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);

        const docRef = doc(db, "settings", "banners");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTopBannerText(data.topBannerText || '');
          setMiddleBannerImage(data.middleBannerImage || '');
          setMiddleBannerCategory(data.middleBannerCategory || 'All');
          setPopupBannerImage(data.popupBannerImage || '');
          setPopupBannerCategory(data.popupBannerCategory || 'All');
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    fetchCategoriesAndBanners();
  }, []);

  // Image convert to Base64 function
  const handleImageChange = (e, setImageState) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      alert("Please select an image smaller than 1MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageState(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, "settings", "banners"), {
        topBannerText,
        middleBannerImage,
        middleBannerCategory,
        popupBannerImage,
        popupBannerCategory,
        updatedAt: new Date()
      }, { merge: true });
      alert("All 3 Banners & Ads Updated Successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white p-4 md:p-6 rounded-lg shadow border mx-auto">
      <h1 className="text-lg md:text-xl font-bold mb-4 text-slate-800 border-b pb-2">Banner & Popup Ads Room (3 Banners)</h1>
      
      <form onSubmit={handleUpdate} className="space-y-5">
        
        {/* 1. TOP BANNER TEXT */}
        <div className="p-3 bg-gray-50 rounded border">
          <label className="block text-xs font-bold mb-1 text-gray-700">1. Top Banner Notice / Text</label>
          <input 
            type="text" 
            value={topBannerText} 
            onChange={(e) => setTopBannerText(e.target.value)} 
            placeholder="e.g. Free Delivery on orders over 500৳!" 
            className="w-full p-2 border rounded text-sm outline-none focus:border-teal-600 bg-white" 
          />
        </div>

        {/* 2. MIDDLE BANNER IMAGE + CATEGORY LINK + DELETE */}
        <div className="p-3 bg-gray-50 rounded border">
          <label className="block text-xs font-bold mb-1 text-gray-700">2. Middle Special Offer Banner Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleImageChange(e, setMiddleBannerImage)} 
            className="w-full p-2 border rounded text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
          />
          
          {middleBannerImage && (
            <div className="mt-2 flex items-center justify-between bg-white p-2 rounded border">
              <div className="flex items-center space-x-2">
                <img src={middleBannerImage} alt="Middle Preview" className="w-20 h-10 object-cover rounded border" />
                <span className="text-xs text-green-600 font-medium">Ready!</span>
              </div>
              <button 
                type="button" 
                onClick={() => setMiddleBannerImage('')}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded font-semibold"
              >
                Delete
              </button>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Link Category for Middle Banner</label>
            <select 
              value={middleBannerCategory} 
              onChange={(e) => setMiddleBannerCategory(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-white outline-none focus:border-teal-600"
            >
              <option value="All">All Categories (Default)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name || cat.categoryName}>
                  {cat.name || cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. BOTTOM CIRCLE POP-UP AD + CATEGORY LINK + DELETE */}
        <div className="p-3 bg-gray-50 rounded border">
          <label className="block text-xs font-bold mb-1 text-gray-700">3. Bottom Circle Pop-up Ad Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleImageChange(e, setPopupBannerImage)} 
            className="w-full p-2 border rounded text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
          />
          
          {popupBannerImage && (
            <div className="mt-2 flex items-center justify-between bg-white p-2 rounded border">
              <div className="flex items-center space-x-2">
                <img src={popupBannerImage} alt="Popup Preview" className="w-12 h-12 object-cover rounded-full border-2 border-teal-600" />
                <span className="text-xs text-green-600 font-medium">Circle Ad Ready!</span>
              </div>
              <button 
                type="button" 
                onClick={() => setPopupBannerImage('')}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded font-semibold"
              >
                Delete
              </button>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Link Category for Circle Pop-up Ad</label>
            <select 
              value={popupBannerCategory} 
              onChange={(e) => setPopupBannerCategory(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-white outline-none focus:border-teal-600"
            >
              <option value="All">All Categories (Default)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name || cat.categoryName}>
                  {cat.name || cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white p-3 rounded text-sm font-bold shadow transition"
        >
          {loading ? "Updating All Banners..." : "Update All Banners"}
        </button>

      </form>
    </div>
  );
}
