import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { IndexedDBPersistence, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAIdbNgRgPFVDfm5moxSEA6HjAxTi5CpKY",
    authDomain: "remotix-3b486.firebaseapp.com",
    projectId: "remotix-3b486",
    storageBucket: "remotix-3b486.firebasestorage.app",
    messagingSenderId: "486535213354",
    appId: "1:486535213354:web:5d1f20d87c41078ec8ee53",
    measurementId: "G-C590V5X4VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore without custom persistence
const db = initializeFirestore(app, {
    localCache: IndexedDBPersistence,
});
const storage = getStorage(app);

export { auth, db, storage };
export default app; 