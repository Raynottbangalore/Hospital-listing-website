import { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { registerUser, loginUser, googleSignIn, logoutUser, resetPassword } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [userAssignedHospitals, setUserAssignedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role);
            setUserPermissions(data.permissions || null);
            setUserAssignedHospitals(data.assignedHospitals || []);
          } else {
            setUserRole("patient");
            setUserPermissions(null);
            setUserAssignedHospitals([]);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("patient");
          setUserPermissions(null);
          setUserAssignedHospitals([]);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserPermissions(null);
        setUserAssignedHospitals([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userPermissions,
    userAssignedHospitals,
    loading,
    register: registerUser,
    login: loginUser,
    googleLogin: googleSignIn,
    logout: logoutUser,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
