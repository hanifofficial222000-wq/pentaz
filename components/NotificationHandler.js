'use client';
import { useEffect } from 'react';
import { getToken } from "firebase/messaging";
import { db, messaging } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function NotificationHandler() {
  useEffect(() => {
    const setupNotification = async () => {
      try {
        if (!messaging) return;
        
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging, { 
            // এখানে আপনার VAPID Key বসান
            vapidKey: 'BLwSLjiLW2wobaUOogbMO5Sk8Tac7ZqUHaMWaztAv_ob-44OpD4EBgK4ISpArg8xBH7H-5enWAW9yklUWPNkXpA' 
          });
          
          if (currentToken) {
            await setDoc(doc(db, "fcm_tokens", currentToken), {
              token: currentToken,
              createdAt: new Date()
            });
            console.log("Token saved");
          }
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    setupNotification();
  }, []);

  return null;
}
