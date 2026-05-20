import { auth, db, firebaseConfig } from "../firebase";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail
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
      password: password, // Store password for admin management
      createdAt: serverTimestamp()
    });

    return uid;
  } catch (error) {
    console.error("Error creating doctor auth user:", doctor);
    throw error;
  }
};

export const createHospitalAuthUser = async (email, password, hospitalInfo) => {
  try {
    const appName = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    
    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", uid), {
      uid: uid,
      name: hospitalInfo.name || "",
      email: email,
      role: "hospital",
      hospitalId: hospitalInfo.hospitalId || "",
      password: password, // Store password for admin management
      createdAt: serverTimestamp()
    });

    return uid;
  } catch (error) {
    console.error("Error creating hospital auth user:", error);
    throw error;
  }
};

export const updateHospitalAuthCredentials = async (oldEmail, oldPassword, newEmail, newPassword, uid, hospitalId) => {
  const appName = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await signInWithEmailAndPassword(secondaryAuth, oldEmail, oldPassword);
    const user = userCredential.user;

    if (newEmail && newEmail !== oldEmail) {
      await updateEmail(user, newEmail);
    }

    if (newPassword && newPassword !== oldPassword) {
      await updatePassword(user, newPassword);
    }

    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", uid), {
      email: newEmail || oldEmail,
      password: newPassword || oldPassword
    }, { merge: true });

    return uid;
  } catch (error) {
    console.error("Sign-in or credential update failed, attempting self-healing re-creation:", error);
    
    if (
      error.code === "auth/invalid-credential" || 
      error.code === "auth/user-not-found" || 
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email" ||
      error.code === "auth/operation-not-allowed"
    ) {
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
        const newUid = userCredential.user.uid;
        await signOut(secondaryAuth);

        await setDoc(doc(db, "users", newUid), {
          uid: newUid,
          name: newEmail,
          email: newEmail,
          role: "hospital",
          hospitalId: hospitalId || "",
          password: newPassword,
          createdAt: serverTimestamp()
        });

        // Invalidate the old user document so the old login loses dashboard access
        if (uid) {
          try {
            await setDoc(doc(db, "users", uid), { role: "disabled" }, { merge: true });
          } catch (e) {
            console.error("Failed to invalidate old user doc", e);
          }
        }

        return newUid;
      } catch (createErr) {
        console.error("Self-healing credential creation failed:", createErr);
        throw createErr;
      }
    } else {
      throw error;
    }
  }
};

export const updateDoctorAuthCredentials = async (oldEmail, oldPassword, newEmail, newPassword, uid, hospitalId, doctorId) => {
  const appName = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await signInWithEmailAndPassword(secondaryAuth, oldEmail, oldPassword);
    const user = userCredential.user;

    if (newEmail && newEmail !== oldEmail) {
      await updateEmail(user, newEmail);
    }

    if (newPassword && newPassword !== oldPassword) {
      await updatePassword(user, newPassword);
    }

    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", uid), {
      email: newEmail || oldEmail,
      password: newPassword || oldPassword
    }, { merge: true });

    return uid;
  } catch (error) {
    console.error("Sign-in or credential update failed, attempting self-healing re-creation for doctor:", error);
    
    if (
      error.code === "auth/invalid-credential" || 
      error.code === "auth/user-not-found" || 
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email" ||
      error.code === "auth/operation-not-allowed"
    ) {
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
        const newUid = userCredential.user.uid;
        await signOut(secondaryAuth);

        await setDoc(doc(db, "users", newUid), {
          uid: newUid,
          name: newEmail,
          email: newEmail,
          role: "doctor",
          hospitalId: hospitalId || "",
          doctorId: doctorId || "",
          password: newPassword,
          createdAt: serverTimestamp()
        });

        // Invalidate the old user document so the old login loses dashboard access
        if (uid) {
          try {
            await setDoc(doc(db, "users", uid), { role: "disabled" }, { merge: true });
          } catch (e) {
            console.error("Failed to invalidate old user doc", e);
          }
        }

        return newUid;
      } catch (createErr) {
        console.error("Self-healing doctor credential creation failed:", createErr);
        throw createErr;
      }
    } else {
      throw error;
    }
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
