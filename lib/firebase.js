import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBep29dhUJLoUPMyf8Re_czgwA6-bzDdVM",
  authDomain: "ayaatshop25.firebaseapp.com",
  projectId: "ayaatshop25",
  storageBucket: "ayaatshop25.firebasestorage.app",
  messagingSenderId: "3316887200",
  appId: "1:3316887200:web:602549db75f11cf68123c5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
