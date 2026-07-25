import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Web-only variant: `@firebase/auth`'s react-native entry (dist/rn) — needed for
// getReactNativePersistence — itself pulls in the real 'react-native' package, which
// breaks under react-native-web. Metro prefers this .web.ts file over firebase.ts on
// web, so that RN-conditioned import never enters the web bundle.
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
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
