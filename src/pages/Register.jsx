import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../components/common/Button";

export const Register = () => {
  return (
    <div className="min-h-screen flex items-stretch overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-secondary relative overflow-hidden items-center justify-center p-24 order-2">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div className="glass bg-white/10 border-white/20 p-8 rounded-[3rem] inline-block mb-8">
              <ShieldCheck size={80} className="text-white" />
            </div>
            <h2 className="text-5xl font-black mb-6">Security & Trust</h2>
            <p className="text-white/70 text-xl max-w-md mx-auto leading-relaxed">
              Your health data is protected with military-grade encryption. We prioritize your privacy above all else.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-12">
              <div className="glass p-6 rounded-[2rem]">
                <p className="text-3xl font-black mb-1">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Data Security</p>
              </div>
              <div className="glass p-6 rounded-[2rem]">
                <p className="text-3xl font-black mb-1">24/7</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">System Monitoring</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative z-10 order-1">
        <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <HeartPulse className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900">MediFind</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Create Account</h1>
            <p className="text-slate-500 font-medium">Join MediFind to manage your health journey effortlessly.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" placeholder="John" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" placeholder="Doe" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input type="email" placeholder="name@example.com" className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary" id="terms" />
              <label htmlFor="terms" className="text-sm text-slate-500 font-medium">
                I agree to the <a href="#" className="text-primary font-bold">Terms</a> and <a href="#" className="text-primary font-bold">Privacy Policy</a>
              </label>
            </div>

            <Button className="w-full py-4 text-lg rounded-2xl" size="lg">Create Account</Button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-primary font-black hover:underline">Login Now</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
