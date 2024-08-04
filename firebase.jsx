// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ2I21V3SXfE1paezGkT0D6b0-qXW1pXI",
  authDomain: "mindhub-c5872.firebaseapp.com",
  projectId: "mindhub-c5872",
  storageBucket: "mindhub-c5872.appspot.com",
  messagingSenderId: "729934037910",
  appId: "1:729934037910:web:9f4104c5a7b2d169c713b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)
export const notesCollection = collection(db, "notes")