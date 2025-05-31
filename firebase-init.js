const firebaseConfig = {
    apiKey: "AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68",
    authDomain: "rekrutracker-app.firebaseapp.com",
    projectId: "rekrutracker-app",
    storageBucket: "rekrutracker-app.firebasestorage.app",
    messagingSenderId: "758407291898",
    appId: "1:758407291898:web:a573e2cd3b416596d37a43",
    measurementId: "G-HQW1YLG9Q1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Debug logging
console.log('Firebase initialized successfully');
console.log('Storage bucket:', firebaseConfig.storageBucket);
console.log('Services available:', {
    firestore: !!db,
    storage: !!storage,
    auth: !!auth
});