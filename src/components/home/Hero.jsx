import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Play, ShieldCheck, Star, Users } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Button } from "../common/Button";
import { fadeIn, staggerContainer } from "../../animations/variants";

export const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [heroImage, setHeroImage] = useState("/assets/images/hero.png");

  useEffect(() => {
    const fetchHeroSetting = async () => {
      try {
        const docRef = doc(db, "settings", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().url) {
          setHeroImage(docSnap.data().url);
        }
      } catch (err) {
        console.error("Error fetching hero setting:", err);
      }
    };
    fetchHeroSetting();
  }, []);

  const handleSearch = () => {
    navigate("/hospitals", { 
      state: { 
        search: searchQuery, 
        location: locationQuery 
      } 
    });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-mesh">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 will-change-transform"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 will-change-transform"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-24 items-center">
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            animate="show"
            className="space-y-12 relative z-20"
          >
            <motion.div variants={fadeIn("up", 0.1)} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-xl shadow-primary/5">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Trusted by 2M+ Users</span>
            </motion.div>

            <motion.div variants={fadeIn("up", 0.2)} className="space-y-6 md:space-y-8">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-black text-slate-900 leading-[0.95] tracking-tight">
                Healthcare <br />
                <span className="text-gradient">Reimagined.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-500 max-w-xl leading-relaxed font-medium">
                Connect with world-class specialists and top-tier hospitals instantly. Experience a seamless journey to wellness with the world's most intuitive booking engine.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeIn("up", 0.3)}
              className="glass p-3 rounded-[3rem] flex flex-col md:flex-row items-center gap-3 shadow-2xl shadow-primary/10 max-w-3xl border border-white/50"
            >
              <div className="flex items-center gap-4 px-6 py-4 flex-1 w-full bg-white/60 rounded-[2.2rem] transition-all focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary/5">
                <Search className="text-primary" size={24} />
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="Hospital, Doctor or Specialty..." 
                   className="bg-transparent border-none outline-none w-full text-slate-900 font-bold placeholder:text-slate-400 text-base"
                />
              </div>
              <div className="flex items-center gap-4 px-6 py-4 flex-1 w-full bg-white/60 rounded-[2.2rem] transition-all focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary/5">
                <MapPin className="text-primary" size={24} />
                <input 
                   type="text" 
                   value={locationQuery}
                   onChange={(e) => setLocationQuery(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="City or Area..." 
                   className="bg-transparent border-none outline-none w-full text-slate-900 font-bold placeholder:text-slate-400 text-base"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full md:w-auto py-5 px-12 text-lg rounded-[2.2rem] shadow-xl shadow-primary/20"
              >
                Find Care
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeIn("up", 0.4)}
              className="flex flex-wrap items-center gap-8 md:gap-12"
            >
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100">
                  <Play size={24} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">How it works</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Watch Video</span>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-8">
                <div className="w-px h-12 bg-slate-200" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-xl font-black text-slate-900">4.9/5</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeIn("left", 0.2)}
            initial="hidden"
            animate="show"
            className="relative mt-12 lg:mt-0"
          >
            {/* Main Hero Image */}
            <div className="relative z-10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[8px] md:border-[12px] border-white bg-slate-900/5">
              <img 
                src={heroImage} 
                alt="Healthcare Excellence" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* Floating Decorative Cards */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-6 rounded-[2.5rem] shadow-2xl z-20 border border-white max-w-[200px]"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs font-black uppercase text-slate-800">Verified</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Certified world-class medical facilities and specialists.</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 glass p-6 rounded-[2.5rem] shadow-2xl z-20 border border-white"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-none">12k+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Doctors</p>
                </div>
              </div>
            </motion.div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};


