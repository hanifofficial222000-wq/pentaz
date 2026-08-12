'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function NewFeatureSection() {
  const [featureData, setFeatureData] = useState(null);

  useEffect(() => {
    async function fetchFeature() {
      try {
        const snap = await getDoc(doc(db, "home_settings", "main"));
        if (snap.exists()) {
          setFeatureData(snap.data());
        }
      } catch (err) {
        console.error("Error fetching feature data:", err);
      }
    }
    fetchFeature();
  }, []);

  // যদি অ্যাডমিন থেকে কোনো ডেটা না দেওয়া হয়, তবে এটি হোম পেজে দেখাবে না (ডিজাইন নষ্ট হবে না)
  if (!featureData?.newFeatureTitle && !featureData?.newFeatureBanner) {
    return null;
  }

  return (
    <div className="max-w-[600px] mx-auto p-4 my-5 bg-[#1a2234] rounded-2xl border border-gray-800 shadow-lg text-white">
      <h2 className="text-sm font-bold text-red-400 mb-2">🔥 একদম নতুন ফিচার</h2>
      
      {/* ফিচারের শিরোনাম */}
      {featureData?.newFeatureTitle && (
        <h3 className="text-base font-semibold text-white mb-2">
          {featureData.newFeatureTitle}
        </h3>
      )}

      {/* ফিচারের ব্যানার ছবি */}
      {featureData?.newFeatureBanner && (
        <img 
          src={featureData.newFeatureBanner} 
          alt="New Feature" 
          className="w-full h-auto rounded-xl object-cover" 
        />
      )}
    </div>
  );
}
