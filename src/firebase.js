// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIfxEu3T2e62PuWpsO5Q2rBg3ubPzQwVs",
  authDomain: "kidz-klinik-pharmacy.firebaseapp.com",
  projectId: "kidz-klinik-pharmacy",
  storageBucket: "kidz-klinik-pharmacy.firebasestorage.app",
  messagingSenderId: "1019841227957",
  appId: "1:1019841227957:web:7e9719903b6b961e4022fc",
  measurementId: "G-2KDFMGXB9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };