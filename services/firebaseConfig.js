import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAIdbNgRgPFVDfm5moxSEA6HjAxTi5CpKY",
    authDomain: "remotix-3b486.firebaseapp.com",
    projectId: "remotix-3b486",
    storageBucket: "remotix-3b486.firebasestorage.app",
    messagingSenderId: "486535213354",
    appId: "1:486535213354:web:5d1f20d87c41078ec8ee53",
    measurementId: "G-C590V5X4VL"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })

export { firebaseApp, auth }