import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Brain, Baby, Bone, 
  UserRound, Stethoscope, ShieldAlert, Eye, HeartPulse
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { fadeIn, staggerContainer } from "../../animations/variants";
import { SpotlightCard } from "../ui/SpotlightCard";

const iconMap = {
  Activity, Brain, Baby, Bone, 
  UserRound, Stethoscope, ShieldAlert, Eye, HeartPulse
};

export const Specializations = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.div
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Categories</span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-tight">
            Explore Medical <br className="hidden xs:block sm:hidden lg:block" />
            <span className="text-gradient">Specializations</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
            Find the right expertise with our comprehensive directory of certified medical specialists across all major departments.
          </p>
        </motion.div>
      </div>

      <motion.div 
        variants={staggerContainer(0.05, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : (
          categories.map((spec) => {
            const Icon = iconMap[spec.icon] || HeartPulse;
            return (
              <motion.div
                key={spec.id}
                variants={fadeIn("up", 0)}
                className="will-change-transform"
              >
                <SpotlightCard className="p-6 md:p-10 flex flex-col items-center gap-4 md:gap-6 cursor-pointer text-center group h-full">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-primary/5 group-hover:shadow-primary/20 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{spec.name}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hidden xs:block">View Doctors</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </section>
  );
};
