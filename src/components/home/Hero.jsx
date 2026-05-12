import { motion } from "framer-motion";
import { Search, MapPin, Play } from "lucide-react";
import { Button } from "../common/Button";
import { fadeIn, staggerContainer } from "../../animations/variants";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-mesh">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 will-change-transform"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] -z-10 will-change-transform"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            animate="show"
            className="space-y-10 relative z-20"
          >
            <motion.div variants={fadeIn("up", 0.1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-black text-primary uppercase tracking-widest">Next-Gen Healthcare</span>
            </motion.div>

            <motion.div variants={fadeIn("up", 0.2)}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] md:leading-[0.95] tracking-tight">
                Find Care <br />
                <span className="text-gradient">Without Limits.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mt-6 md:mt-8 max-w-xl leading-relaxed font-medium">
                MediFind is the world's most advanced platform for connecting patients with top-tier healthcare facilities and specialists instantly.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeIn("up", 0.3)}
              className="glass p-2 md:p-3 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-2 md:gap-3 shadow-2xl shadow-primary/10 max-w-3xl will-change-transform"
            >
              <div className="flex items-center gap-4 px-6 py-3 md:py-4 flex-1 w-full bg-white/50 rounded-[1.8rem]">
                <Search className="text-primary" size={20} md:size={24} />
                <input 
                   type="text" 
                   placeholder="Hospital, Doctor..." 
                   className="bg-transparent border-none outline-none w-full text-slate-800 font-bold placeholder:text-slate-400 text-sm md:text-base"
                />
              </div>
              <div className="flex items-center gap-4 px-6 py-3 md:py-4 flex-1 w-full bg-white/50 rounded-[1.8rem]">
                <MapPin className="text-primary" size={20} md:size={24} />
                <input 
                   type="text" 
                   placeholder="Location..." 
                   className="bg-transparent border-none outline-none w-full text-slate-800 font-bold placeholder:text-slate-400 text-sm md:text-base"
                />
              </div>
              <Button className="w-full md:w-auto py-4 md:py-5 px-10 text-base md:text-lg rounded-[1.8rem]">Explore</Button>
            </motion.div>

            <motion.div 
              variants={fadeIn("up", 0.4)}
              className="flex flex-wrap items-center gap-10"
            >
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-slate-900">500+</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Partners</span>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-slate-900">24/7</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Support</span>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-4">
                <button className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-all border border-slate-100">
                  <Play size={20} fill="currentColor" />
                </button>
                <span className="text-sm font-black text-slate-600">How it works</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeIn("left", 0.2)}
            initial="hidden"
            animate="show"
            className="relative hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000" 
              alt="Healthcare" 
              className="w-full h-auto rounded-[3rem] shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
