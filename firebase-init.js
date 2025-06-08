// Shared Firebase initialization and helpers
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68",
    authDomain: "rekrutracker-app.firebaseapp.com",
    projectId: "rekrutracker-app",
    storageBucket: "rekrutracker-app.firebasestorage.app",
    messagingSenderId: "758407291898",
    appId: "1:758407291898:web:a573e2cd3b416596d37a43",
    measurementId: "G-HQW1YLG9Q1"
};

export function initFirebase() {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const auth = getAuth(app);

    // expose services globally for legacy scripts
    window.db = db;
    window.auth = auth;

    return { app, db, auth };
}

export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// expose sanitize function globally for non-module scripts
window.sanitizeHTML = sanitizeHTML;
