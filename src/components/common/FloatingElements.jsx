import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

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
              className="w-12 h-12 bg-white text-primary rounded-full shadow-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-slate-100 cursor-pointer"
            >
              <ArrowUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
