import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, Eye, ArrowRight } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { Button } from "../components/common/Button";

export const Login = () => {
  return (
    <div className="min-h-screen flex items-stretch overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative z-10">
        <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <HeartPulse className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900">MediFind</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Welcome Back!</h1>
            <p className="text-slate-500 font-medium">Login to access your health dashboard and appointments.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium"
                />
                <button className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <Button className="w-full py-4 text-lg rounded-2xl" size="lg">Sign In</Button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
              <span className="bg-white px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600">
              <FaGoogle size={20} className="text-red-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600">
              <FaGithub size={20} className="text-slate-900" /> Github
            </button>
          </div>

          <p className="mt-10 text-center text-slate-500 font-medium">
            Don't have an account? <Link to="/register" className="text-primary font-black hover:underline">Sign Up Free</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-24">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 text-white space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass bg-white/10 border-white/20 p-12 rounded-[4rem] shadow-2xl backdrop-blur-2xl"
          >
            <h2 className="text-5xl font-black mb-6 leading-tight">Better Health Starts with Better Access.</h2>
            <p className="text-white/70 text-xl leading-relaxed mb-10">
              Join thousands of users who trust MediFind for their healthcare needs.
            </p>
            
            <div className="space-y-6">
              {[
                "Manage your medical records securely",
                "Instant appointment booking",
                "24/7 access to top-rated specialists"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="font-bold">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <div className="flex items-center justify-between px-8">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-12 h-12 rounded-full border-4 border-primary" />
              ))}
            </div>
            <p className="font-bold opacity-80">50k+ Happy Patients</p>
          </div>
        </div>
      </div>
    </div>
  );
};
