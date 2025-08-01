// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🧠 Replace the below config with your own from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBNTmF6WCyH_wcnbhBDBTFX7plv2x9Id60",
  authDomain: "insta-maintain.firebaseapp.com",
  projectId: "insta-maintain",
  storageBucket: "insta-maintain.firebasestorage.app",
  messagingSenderId: "431949036005",
  appId: "1:431949036005:web:0bf7515b195c2b4342d70c",
  measurementId: "G-JGDVKXK6LB",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔥 Access Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// 📤 Export for use in other files
export { db, storage };

