import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useSiteConfig() {
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'globalConfig');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteConfig(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching site config:", err);
      }
    };

    fetchConfig();
  }, []);

  return siteConfig;
}
