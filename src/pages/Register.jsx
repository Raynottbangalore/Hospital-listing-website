import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Mail, Lock, ArrowLeft, User, Phone, MapPin } from "lucide-react";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFirebaseError = (err) => {
    switch(err.code) {
      case "auth/email-already-in-use": setError("Email already exists."); break;
      case "auth/invalid-email": setError("Invalid email address."); break;
      case "auth/weak-password": setError("Password is too weak. Must be at least 6 characters."); break;
      case "auth/network-request-failed": setError("Network error. Please try again."); break;
      default: setError("Failed to create account. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile || !email || !password || !confirmPassword) {
      return setError("Please fill in all required fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    try {
      setError("");
      setLoading(true);
      await register(email, password, name, {
        mobile,
        altMobile,
        location: userLocation
      });
      navigate("/");
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

      {/* Animated Background */}
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

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Create Account</h1>
          <p className="text-slate-500 font-medium text-sm">Join MediFind to manage your health journey</p>
          {error && <p className="text-red-500 text-sm font-bold mt-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <User size={18} />
              </div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-4 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone size={18} />
                </div>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1 234 567 890" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-4 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alternate Mobile</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone size={18} />
                </div>
                <input type="tel" value={altMobile} onChange={(e) => setAltMobile(e.target.value)} placeholder="+1 987 654 321" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-4 py-3 outline-none transition-all font-medium text-slate-700 text-sm" />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <MapPin size={18} />
              </div>
              <input type="text" value={userLocation} onChange={(e) => setUserLocation(e.target.value)} placeholder="City, Country" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-4 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
            </div>
          </div>

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
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-6 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/5 rounded-xl pl-11 pr-6 py-3 outline-none transition-all font-medium text-slate-700 text-sm" required />
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" required className="w-4 h-4 rounded-lg border-slate-200 text-primary focus:ring-primary/50" id="terms" />
            <label htmlFor="terms" className="text-xs text-slate-500 font-medium">
              I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>
            </label>
          </div>

          <Button disabled={loading} type="submit" className="w-full py-3.5 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] mt-2">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          Already have an account? <Link to="/login" className="text-primary font-black hover:underline ml-1">Login Now</Link>
        </p>
      </motion.div>
    </div>
  );
};
