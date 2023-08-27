// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAo-abh7eCbQW4H5f4aoC5DNIFyrH-xLFY",
  authDomain: "gabo-1aefe.firebaseapp.com",
  projectId: "gabo-1aefe",
  storageBucket: "gabo-1aefe.appspot.com",
  messagingSenderId: "268606573142",
  appId: "1:268606573142:web:c382947c90aa8138ab89f7",
  measurementId: "G-L0BPVDFJHV",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const firestore = getFirestore(app);
