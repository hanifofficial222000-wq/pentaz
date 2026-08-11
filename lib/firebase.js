import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAbyRJXTUVP0KIKX_bwZLHu61nWRwpDdI",
  authDomain: "ayaat-shop25.firebaseapp.com",
  projectId: "ayaat-shop25",
  storageBucket: "ayaat-shop25.firebasestorage.app",
  messagingSenderId: "330360389110",
  appId: "1:330360389110:web:9efe105a0baa0d1e951bd7",
  measurementId: "G-2RZ8NQ11GJ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
