import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqnd-acSF4Ga-rkbQQQeO1SHS2jEurQ28",
  authDomain: "movetrip.firebaseapp.com",
  projectId: "movetrip",
  storageBucket: "movetrip.firebasestorage.app",
  messagingSenderId: "606236576605",
  appId: "1:606236576605:web:8894c8b5a5cd9288e636b4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);