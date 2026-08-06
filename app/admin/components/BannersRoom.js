'use client';
import { useState } from 'react';

export default function BannersRoom() {
  const [topBannerText, setTopBannerText] = useState('');
  const [popupBannerImage, setPopupBannerImage] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Banners Updated Successfully!");
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-lg shadow border">
      <h1 className="text-xl font-bold mb-4 text-slate-800">Banner & Popup Ads Room</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Top Banner Text / Image URL</label>
          <input type="text" value={topBannerText} onChange={(e) => setTopBannerText(e.target.value)} className="w-full p-2 border rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Popup Banner / Ad Image URL</label>
          <input type="text" value={popupBannerImage} onChange={(e) => setPopupBannerImage(e.target.value)} className="w-full p-2 border rounded text-sm" />
        </div>
        <button type="submit" className="w-full bg-teal-700 text-white p-2.5 rounded text-sm font-bold">Update Banners</button>
      </form>
    </div>
  );
}
