import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getAnalytics,
  isSupported,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRpZQDzURXJmXc808oeeEG6yOCaA3N8wo",
  authDomain: "doces-6f438.firebaseapp.com",
  projectId: "doces-6f438",
  storageBucket: "doces-6f438.firebasestorage.app",
  messagingSenderId: "138326287345",
  appId: "1:138326287345:web:7ebb987406539395b3da50",
  measurementId: "G-CF0WEP7XKN",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
      return;
    }

    console.warn("O Firebase Analytics não é compatível com este navegador.");
  })
  .catch((error) => {
    console.error("Falha ao inicializar o Firebase Analytics:", error);
  });
