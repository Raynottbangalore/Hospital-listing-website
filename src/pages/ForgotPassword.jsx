import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-primary to-secondary rounded-t-full" />
        
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <KeyRound size={28} strokeWidth={2.5} className="-rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-[#f0fdf4] border-l-4 border-green-500 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            <p className="text-green-700 font-bold text-sm">Check your inbox for further instructions</p>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            </div>
          )}
          
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={18} strokeWidth={2} />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full bg-white border border-slate-200 focus:border-primary/50 rounded-2xl pl-12 pr-6 py-3.5 outline-none transition-all font-medium text-slate-700 text-sm shadow-sm"
              required
            />
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-4 text-sm rounded-2xl bg-primary hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-blue-700 transition-colors">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
