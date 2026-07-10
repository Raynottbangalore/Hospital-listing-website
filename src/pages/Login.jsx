import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HeartPulse, Mail, Lock, Eye, ArrowLeft, Building2, UserCircle } from "lucide-react";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("user");
  
  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFirebaseError = (err) => {
    switch(err.code) {
      case "auth/invalid-email": setError("Invalid email address."); break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": setError("Invalid email or password."); break;
      case "auth/popup-closed-by-user": setError("Popup closed before completion."); break;
      case "auth/network-request-failed": setError("Network error. Please try again."); break;
      default: setError(err.message || "An error occurred. Please try again.");
    }
  };

  const handleAuthSuccess = async (userCredential) => {
    const docRef = doc(db, "users", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    let role = "patient";
    let permissions = {};
    if (docSnap.exists()) {
      const data = docSnap.data();
      role = data.role;
      permissions = data.permissions || {};
    }

    if (activeTab === "user") {
      if (role === "hospital" || role === "doctor") {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        throw { code: "auth/access-denied", message: "Access Denied: Please use the Hospital portal to log in as a hospital or doctor." };
      }
    } else if (activeTab === "hospital") {
      if (role !== "hospital" && role !== "doctor") {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        throw { code: "auth/access-denied", message: "Access Denied: Only hospitals and doctors can log in through this portal." };
      }
    }

    if (role === "disabled") {
      const { getAuth, signOut } = await import("firebase/auth");
      await signOut(getAuth());
      throw { code: "auth/user-disabled", message: "This account's credentials have been changed. Please use the new credentials." };
    }

    const from = location.state?.from?.pathname || "/";

    if (role === "super_admin") {
      navigate("/admin/dashboard");
    } else if (role === "admin") {
      if (permissions.dashboard) navigate("/admin/dashboard");
      else if (permissions.hospitals) navigate("/admin/hospitals");
      else if (permissions.doctors) navigate("/admin/doctors");
      else if (permissions.appointments) navigate("/admin/appointments");
      else if (permissions.offers) navigate("/admin/offers");
      else if (permissions.users) navigate("/admin/users");
      else if (permissions.analytics) navigate("/admin/analytics");
      else if (permissions.categories) navigate("/admin/categories");
      else if (permissions.gallery) navigate("/admin/gallery");
      else if (permissions.settings) navigate("/admin/settings");
      else navigate("/unauthorized");
    } else if (role === "doctor") {
      navigate("/doctor/dashboard");
    } else if (role === "hospital") {
      navigate("/hospital/dashboard");
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    
    try {
      setLoading(true);
      const userCredential = await login(email, password);
      await handleAuthSuccess(userCredential);
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const userCredential = await googleLogin();
      await handleAuthSuccess(userCredential);
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-8 py-10">
      <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md">
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 sm:p-12 relative z-10 border border-slate-100"
      >
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <HeartPulse className="text-white" size={28} />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">MediFind</span>
          </Link>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => { setActiveTab("user"); setError(""); }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "user" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <UserCircle size={18} />
            User Login
          </button>
          <button
            onClick={() => { setActiveTab("hospital"); setError(""); }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "hospital" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <Building2 size={18} />
            Hospital Login
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {activeTab === "hospital" ? "Hospital Portal" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {activeTab === "hospital" ? "Access your hospital management dashboard" : "Login to access your health dashboard"}
          </p>
          {error && <p className="text-red-500 text-sm font-bold mt-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-4 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-10 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1">
                <Eye size={16} />
              </button>
            </div>
          </div>

          <Button disabled={loading} type="submit" className="w-full py-3.5 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] mt-2">
            {loading ? "Processing..." : (activeTab === "hospital" ? "Sign In as Hospital" : "Sign In")}
          </Button>
        </form>

        {activeTab === "user" && (
          <>
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="bg-white px-4 text-slate-400">Or continue with</span></div>
            </div>
            <div className="mt-6">
              <button disabled={loading} onClick={handleGoogleLogin} type="button" className="flex w-full items-center justify-center gap-3 px-6 py-3 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700 text-sm disabled:opacity-50 active:scale-[0.98] shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
            
            <p className="mt-6 text-center text-slate-500 font-medium text-sm">
              Don't have an account?
              <Link to="/register" className="text-primary font-black hover:underline ml-1">
                Create one
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};
