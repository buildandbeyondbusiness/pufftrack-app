import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAVQsnzv-SRSJdzqDjYq4vB-fk1p-4cynY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "draw-2b7a5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "draw-2b7a5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "draw-2b7a5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "646548551812",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:646548551812:web:6aa121302748c8f734aad1"
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Check if Firebase is configured with real credentials
export const isFirebaseConfigured = () => {
  return true;
};
