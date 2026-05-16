import { auth, db, firebaseConfig } from "../firebase";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const createDoctorAuthUser = async (email, password, doctorInfo) => {
  try {
    const appName = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    
    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", uid), {
      uid: uid,
      name: doctorInfo.name || "",
      email: email,
      role: "doctor",
      hospitalId: doctorInfo.hospitalId || "",
      doctorId: doctorInfo.doctorId || "",
      createdAt: serverTimestamp()
    });

    return uid;
  } catch (error) {
    console.error("Error creating doctor auth user:", error);
    throw error;
  }
};

export const registerUser = async (email, password, name = "") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name || user.displayName || "",
      email: user.email,
      role: "patient",
      createdAt: serverTimestamp()
    });

    return userCredential;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const googleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        role: "patient",
        createdAt: serverTimestamp()
      });
    }

    return userCredential;
  } catch (error) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};
