// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de tu proyecto (copiada de Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyAS1ml2lRrLzjrNjkFWpFNkgfEltEiXNno",
    authDomain: "joboclocksie.firebaseapp.com",
    projectId: "joboclocksie",
    storageBucket: "joboclocksie.firebasestorage.app",
    messagingSenderId: "488050335352",
    appId: "1:488050335352:web:e9af92b5f171869971d78d",
    measurementId: "G-WKS0790PMT"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

export { db };
