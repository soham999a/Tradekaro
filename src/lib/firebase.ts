// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase keys are properly configured
const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return apiKey &&
         apiKey !== 'AIzaSyDemoKeyForTradeKaro123456789' &&
         apiKey !== 'AIzaSyBvXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX' &&
         !apiKey.includes('XxXxXx') &&
         apiKey.startsWith('AIzaSy') &&
         apiKey.length > 30; // Real Firebase keys are longer
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('🔥 Firebase initialized successfully!');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.log('🎯 TradeKaro running in DEMO MODE - All features available without Firebase setup!');
  console.log('📝 To enable real user accounts, see FIREBASE_SETUP.md');
}

export { auth, db, googleProvider };
export default app;
