import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCYaDCEmeJJ9xszGvt0fvo5FTtObN7Uuzk",
  authDomain: "govt-exam-test-ff0de.firebaseapp.com",
  projectId: "govt-exam-test-ff0de",
  storageBucket: "govt-exam-test-ff0de.firebasestorage.app",
  messagingSenderId: "1024314671359",
  appId: "1:1024314671359:web:f11f2c7b055484898e4cca",
  measurementId: "G-FN7J0Z6VZZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
