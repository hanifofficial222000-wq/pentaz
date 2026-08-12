import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getGlobalSettings() {
  try {
    const docRef = doc(db, "settings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Global settings fetch error:", error);
    return null;
  }
}
