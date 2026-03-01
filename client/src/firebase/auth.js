import { auth, db } from './config';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create detailed profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: displayName,
            email: user.email,
            role: "student", // default role
            xp: 0,
            level: 1,
            rank: "Novice Alchemist",
            equippedLabCoat: "#ffffff",
            badges: [],
            completedExperiments: [],
            discoveredReactions: [],
            inventory: [],
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("Error in registration:", error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error in login:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};
