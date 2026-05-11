import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { hospitals } from "../../data/hospitals";
import { Button } from "../common/Button";
import { fadeIn } from "../../animations/variants";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const FeaturedHospitals = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-white/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
        <motion.div
          variants={fadeIn("right", 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-2xl"
        >
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Top Rated</span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-tight">
            Premium <br className="hidden xs:block" />
            <span className="text-gradient">Healthcare</span>
          </h2>
          <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed">
            Discover our handpicked selection of top-tier hospitals, vetted for their exceptional medical expertise and patient-centric care.
          </p>
        </motion.div>
        <Link to="/hospitals">
          <Button variant="outline" className="group px-10 py-5 text-lg rounded-[2rem] border-primary/20 hover:border-primary">
            All Hospitals <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Button>
        </Link>
      </div>

      <motion.div 
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={40}
          slidesPerView={1}
          watchSlidesProgress={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
          className="pb-24 !overflow-visible"
        >
          {hospitals.map((hospital) => (
            <SwiperSlide key={hospital.id}>
              <motion.div 
                whileHover={{ y: -15 }}
                className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col will-change-transform"
              >
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 glass px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-slate-900">{hospital.rating}</span>
                  </div>
                  {hospital.emergency && (
                    <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase animate-pulse shadow-lg">
                      Emergency 24/7
                    </div>
                  )}
                </div>
                
                <div className="p-10 flex-grow flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hospital.departments.slice(0, 2).map((dept) => (
                      <span key={dept} className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                        {dept}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors leading-tight">{hospital.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
                    <MapPin size={16} className="text-primary" />
                    <span>{hospital.location}</span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        hospital.status === "Open" ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "text-xs font-black uppercase tracking-widest",
                        hospital.status === "Open" ? "text-green-600" : "text-red-500"
                      )}>
                        {hospital.status} Now
                      </span>
                    </div>
                    <Link to={`/hospitals/${hospital.id}`}>
                      <Button size="sm" variant="ghost" className="p-0 hover:bg-transparent hover:text-primary text-primary font-black uppercase tracking-widest text-xs gap-2">
                        View Details <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};
