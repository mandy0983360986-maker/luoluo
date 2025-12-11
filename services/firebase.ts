import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper to safely get env var without crashing if process is undefined
const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let initializationError: Error | null = null;

const getFirebaseConfig = () => {
  // 1. Try Environment Variables
  const envConfig = {
    apiKey: getEnv('FIREBASE_API_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('FIREBASE_APP_ID')
  };

  if (envConfig.apiKey) {
    return envConfig;
  }

  // 2. Try Local Storage (Fallback for demos/manual setup)
  try {
    const localConfig = localStorage.getItem('firebase_config');
    if (localConfig) {
      return JSON.parse(localConfig);
    }
  } catch (e) {
    console.warn("Failed to parse local firebase config", e);
  }

  return null;
};

try {
  const config = getFirebaseConfig();

  if (!config || !config.apiKey) {
    throw new Error("Firebase Configuration Missing");
  }

  // Prevent multiple initializations
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error: any) {
  console.error("Firebase Initialization Failed:", error);
  // Preserve the specific error message
  initializationError = error instanceof Error ? error : new Error(String(error));
}

export { auth, db, initializationError };