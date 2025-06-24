import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyDFg-E1mVpoP0njYtz99UL45zhymTo_nrc",
  authDomain: "elearningsa-bca0b.firebaseapp.com",
  projectId: "elearningsa-bca0b",
  storageBucket: "elearningsa-bca0b.firebasestorage.app",
  messagingSenderId: "912926600431",
  appId: "1:912926600431:web:9996ec54d089a3ee10bf1a",
  measurementId: "G-0LSKFJ5CV4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export { auth, googleProvider, signInWithPopup, analytics };