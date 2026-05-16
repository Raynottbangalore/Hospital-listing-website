import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";
import { FloatingElements } from "../components/common/FloatingElements";
import { PatientChatWidget } from "../components/chat/PatientChatWidget";
import { VideoConsultationRoom } from "../components/consultation/VideoConsultationRoom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

export const MainLayout = () => {
  const { pathname } = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-mesh selection:bg-primary/20">
      <Navbar />
      <FloatingElements />
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <PatientChatWidget />
      <VideoConsultationRoom />
      <Footer />
    </div>
  );
};
