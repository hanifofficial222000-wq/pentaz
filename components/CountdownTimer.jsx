'use client';

import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!endsAt) return;

    // ফায়ারবেস বা সাধারণ ডেট অবজেক্ট হ্যান্ডেল করার জন্য
    const targetTime = endsAt?.toDate ? endsAt.toDate() : new Date(endsAt);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isExpired) {
    return <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">অফারের সময় শেষ!</span>;
  }

  return (
    <div className="flex items-center gap-1 text-[11px] font-extrabold text-white bg-red-600 px-2.5 py-1.5 rounded-lg shadow-sm w-max">
      <span>⏰ অফার শেষ:</span>
      <span className="bg-black/30 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}ঘণ্টা</span>
      <span>:</span>
      <span className="bg-black/30 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}মি</span>
      <span>:</span>
      <span className="bg-black/30 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}সে</span>
    </div>
  );
}
