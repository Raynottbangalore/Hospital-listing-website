import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp, MessageCircle } from "lucide-react";

export const FloatingElements = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-white text-primary rounded-full shadow-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-slate-100"
            >
              <ArrowUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Emergency Floating Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-red-500 text-white rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center group relative"
        >
          <Phone size={28} />
          <span className="absolute right-full mr-4 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Emergency Call
          </span>
        </motion.button>

        {/* WhatsApp/Chat Floating Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-green-500 text-white rounded-full shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center group relative"
        >
          <MessageCircle size={28} />
          <span className="absolute right-full mr-4 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Live Chat
          </span>
        </motion.button>
      </div>
    </>
  );
};
