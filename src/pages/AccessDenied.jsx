import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "../components/common/Button";

export const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-8">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-red-500/5 p-8 sm:p-12 relative z-10 border border-slate-100 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-red-50 p-4 rounded-full">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-500 font-medium mb-8 text-lg">
          You do not have permission to access this page.
        </p>

        <Link to="/">
          <Button className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2" size="lg">
            <Home size={20} /> Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
