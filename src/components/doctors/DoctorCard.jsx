import { motion } from "framer-motion";
import { Star, Clock, Briefcase, GraduationCap, MapPin } from "lucide-react";
import { Button } from "../common/Button";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

export const DoctorCard = ({ doctor }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="glass p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 group"
    >
      <div className="relative w-full md:w-32 h-48 md:h-32 flex-shrink-0">
        <img 
          src={doctor.image} 
          alt={doctor.name} 
          className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
        />
        <div 
          className={cn(
            "absolute top-2 right-2 md:top-auto md:right-auto md:-bottom-2 md:-right-2 w-4 h-4 rounded-full border-2 border-white transition-colors",
            doctor.available ? "bg-green-500" : "bg-slate-300"
          )} 
          title={doctor.available ? "Available Now" : "Unavailable"} 
        />
      </div>

      <div className="flex-grow space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-lg">
            {doctor.category || "Specialist"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
          {doctor.name}
        </h3>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Briefcase size={14} className="text-slate-400" />
            <span>{doctor.experience || "5"} Exp</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <GraduationCap size={14} className="text-slate-400" />
            <span>{doctor.qualifications || "MBBS, MD"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{doctor.hospitalName || "MediFind Hospital"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock size={14} className="text-slate-400" />
            <span className={doctor.available ? "text-slate-500" : "text-red-500 font-bold"}>
              {doctor.available ? "Available Now" : "Currently Unavailable"}
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-2">
          <span className="text-lg font-bold text-slate-900">${doctor.fee || "50"} <span className="text-xs text-slate-400 font-normal">/ Consultation</span></span>
          <Link to={`/doctors/${doctor.id}`}>
            <Button size="sm">Book Now</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
