import { motion } from "framer-motion";
import { Phone, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "../common/Button";
import { fadeIn } from "../../animations/variants";

export const EmergencyBanner = () => {
  return (
    <section className="section-padding">
      <motion.div
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-r from-primary to-blue-600 p-8 md:p-16 relative overflow-hidden shadow-2xl"
      >
        {/* Decorative Circles */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-black/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <AlertCircle className="text-white" size={24} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">Emergency Services</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              In Case of Emergency, <br className="hidden sm:block" /> Call Us Immediately!
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-lg">
              Our 24/7 emergency response team is always ready to provide immediate medical assistance and ambulance support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="glass" size="lg" className="gap-3">
                <Phone size={20} /> +1 (800) 123-4567
              </Button>
              <Button variant="outline" className="bg-white text-primary border-white hover:bg-white/90" size="lg">
                Find Nearest Hospital
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800" 
                alt="Ambulance Service" 
                loading="lazy"
                className="rounded-3xl shadow-2xl border-4 border-white/20"
              />
            </motion.div>
            
            {/* Quick Stats */}
            <div className="absolute -bottom-8 -left-8 glass p-6 rounded-3xl shadow-xl">
              <p className="text-primary font-bold text-3xl">8 Mins</p>
              <p className="text-slate-600 text-sm font-medium">Average Response Time</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
