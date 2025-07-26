import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8NWKGtY4v8tcianRJum3U8qnjZPRqUug",
  authDomain: "vehiclerental-f7ea0.firebaseapp.com",
  projectId: "vehiclerental-f7ea0",
  storageBucket: "vehiclerental-f7ea0.firebasestorage.app",
  messagingSenderId: "63540366532",
  appId: "1:63540366532:web:efedaa1e170b4d47878d91"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { serverTimestamp };
