import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Mail, Lock } from "lucide-react";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
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
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    try {
      setError("");
      setLoading(true);
      await register(email, password);
      navigate("/");
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-8 py-10">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 sm:p-12 relative z-10 border border-slate-100"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <HeartPulse className="text-white" size={28} />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">MediFind</span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Create Account</h1>
          <p className="text-slate-500 font-medium">Join MediFind to manage your health journey</p>
          {error && <p className="text-red-500 text-sm font-bold mt-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail size={20} />
              </div>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                placeholder="name@example.com" 
                className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium text-slate-700" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium text-slate-700" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium text-slate-700" 
                required 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              required 
              className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/50" 
              id="terms" 
            />
            <label htmlFor="terms" className="text-sm text-slate-500 font-medium">
              I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>
            </label>
          </div>

          <Button disabled={loading} type="submit" className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Already have an account? <Link to="/login" className="text-primary font-black hover:underline ml-1">Login Now</Link>
        </p>
      </motion.div>
    </div>
  );
};
