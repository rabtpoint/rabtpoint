import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'rabtpoint-5329b.firebaseapp.com',
  projectId: 'rabtpoint-5329b',
  storageBucket: 'rabtpoint-5329b.firebasestorage.app',
  messagingSenderId: '864409340491',
  appId: '1:864409340491:web:8bdabf63931a7408f89bce',
  measurementId: 'G-1H2CF47F5G'
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const getFirebaseAuth = () => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase env values missing hain. Vercel/client .env me Firebase config add karo.');
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  return getAuth(app);
};

const explainFirebaseError = (error) => {
  if (error.code === 'auth/configuration-not-found') {
    throw new Error('Firebase Authentication enable nahi hai. Firebase Console me Email/Password sign-in method enable karo.');
  }

  if (error.code === 'auth/unauthorized-domain') {
    throw new Error('Firebase me ye domain authorized nahi hai. Authorized domains me localhost/rabtpoint.com add karo.');
  }

  throw error;
};

export const sendSignupVerification = async ({ email, password }) => {
  try {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(credential.user, {
      url: import.meta.env.VITE_WEBSITE_URL || window.location.origin
    });
    await signOut(auth);
  } catch (error) {
    explainFirebaseError(error);
  }
};

export const confirmEmailVerification = async ({ email, password }) => {
  try {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);

    await reload(credential.user);

    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw new Error('Email abhi verified nahi hai. Inbox me verification link click karo.');
    }

    await signOut(auth);
  } catch (error) {
    explainFirebaseError(error);
  }
};
