import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ১. গ্লোবাল সেটিংস রিড (Fetch) করার ফাংশন
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

// ২. গ্লোবাল সেটিংস আপডেট বা সেভ করার ফাংশন
export async function updateGlobalSettings(newSettings) {
  try {
    const docRef = doc(db, "settings", "global");
    // setDoc এর সাথে { merge: true } ব্যবহার করা হয়েছে যাতে আগের ডাটা মুছে না গিয়ে শুধু নতুন ফিল্ডগুলো আপডেট হয়
    await setDoc(docRef, newSettings, { merge: true });
    return { success: true, message: "Settings updated successfully!" };
  } catch (error) {
    console.error("Global settings update error:", error);
    return { success: false, error: error.message };
  }
}
