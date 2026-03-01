import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCpKO9G7Oqvi9rnjhvxkXU-EMajzWn8rhg",
    authDomain: "c-lab-56c47.firebaseapp.com",
    projectId: "c-lab-56c47",
    storageBucket: "c-lab-56c47.firebasestorage.app",
    messagingSenderId: "946446907742",
    appId: "1:946446907742:web:08b5440f0b4efd3ee637cf",
    measurementId: "G-QGCZF76FKX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);

// Modern Firestore Initialization with resilient cache settings
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

export const storage = getStorage(app);
