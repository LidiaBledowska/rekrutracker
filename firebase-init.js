const firebaseConfig = {
    apiKey: "AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68",
    authDomain: "rekrutracker-app.firebaseapp.com",
    projectId: "rekrutracker-app",
    storageBucket: "rekrutracker-app.firebasestorage.app",
    messagingSenderId: "758407291898",
    appId: "1:758407291898:web:a573e2cd3b416596d37a43",
    measurementId: "G-HQW1YLG9Q1"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();