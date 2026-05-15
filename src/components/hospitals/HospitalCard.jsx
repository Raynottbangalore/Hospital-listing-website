import { motion } from "framer-motion";
import { MapPin, Star, Clock, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../common/Button";
import { Link } from "react-router-dom";

export const HospitalCard = ({ hospital, specializations = [] }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="glass rounded-3xl overflow-hidden shadow-lg border border-slate-100 h-full flex flex-col group"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={hospital.image} 
          alt={hospital.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-slate-900">{hospital.rating || "4.5"}</span>
        </div>
        {hospital.emergency && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-pulse">
            24/7 EMERGENCY
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Verified Facility</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
          {hospital.name}
        </h3>
        
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
          <MapPin size={14} className="text-slate-400" />
          <span>{hospital.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
          {specializations.length > 0 ? (
            specializations.slice(0, 3).map((dept) => (
              <span key={dept} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                {dept}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No specializations listed</span>
          )}
        </div>

        <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className={(hospital.status || "Open") === "Open" ? "text-green-500" : "text-red-500"} />
              <span className={`text-xs font-bold ${(hospital.status || "Open") === "Open" ? "text-green-600" : "text-red-500"}`}>
                {hospital.status || "Open"} Now
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Phone size={12} />
              <span>{hospital.contact || "+1 555-0000"}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to={`/hospitals/${hospital.id}`}>
              <Button variant="outline" size="sm" className="w-full">Details</Button>
            </Link>
            <Link to="/booking" state={{ hospital }}>
              <Button size="sm" className="w-full">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
