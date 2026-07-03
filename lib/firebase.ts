import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-expect-error — @firebase/auth exports this from its RN entry (dist/rn); Metro resolves
// the react-native condition at runtime but tsc sees the top-level browser types.
import { getReactNativePersistence, initializeAuth } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';

// EXPO_PUBLIC_* vars are inlined by Babel only for static `process.env.X`
// member expressions. Dynamic access (process.env[k]) resolves to undefined
// in production bundles even when the value was set at build time, so every
// env read below must stay a static property access.
const requiredEnv = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.keys(requiredEnv).filter(
  (k) => !requiredEnv[k as keyof typeof requiredEnv],
);
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missing.join(', ')}. ` +
      'Add them to .env for local dev or via EAS secrets for production builds.',
  );
}

const firebaseConfig = {
  apiKey: requiredEnv.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredEnv.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnv.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnv.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnv.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { app, auth, db };
