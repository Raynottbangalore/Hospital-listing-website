import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Star, Clock, Briefcase, GraduationCap, MapPin, 
  MessageSquare, Video, Calendar, ArrowLeft,
  ShieldCheck, Award, Heart
} from "lucide-react";
import { doctors } from "../data/doctors";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";

export const DoctorProfile = () => {
  const { id } = useParams();
  const doctor = doctors.find(d => d.id === parseInt(id)) || doctors[0];

  const stats = [
    { label: "Experience", value: doctor.experience, icon: Briefcase },
    { label: "Patients", value: "2,000+", icon: Heart },
    { label: "Reviews", value: doctor.reviews, icon: MessageSquare },
    { label: "Rating", value: doctor.rating, icon: Star },
  ];

  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Doctors
        </Link>

        <div className="grid lg:grid-cols-[1fr_450px] gap-12">
          {/* Main Info */}
          <div className="space-y-10">
            <motion.div
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              animate="show"
              className="glass p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow space-y-4 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {doctor.specialization}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={16} fill="currentColor" />
                      <span>{doctor.rating}</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">{doctor.name}</h1>
                  <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                    <MapPin size={20} className="text-primary" /> {doctor.hospital}
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    <Button className="gap-2" size="sm">
                      <Video size={18} /> Online Consultation
                    </Button>
                    <Button variant="outline" className="gap-2" size="sm">
                      <MessageSquare size={18} /> Chat with Dr.
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-slate-100">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center md:text-left space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                      <stat.icon size={18} />
                      <span className="text-lg font-black text-slate-900">{stat.value}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* About & Education */}
            <div className="space-y-8">
              <div className="glass p-8 md:p-12 rounded-[3rem] space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={24} className="text-primary" /> About {doctor.name}
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {doctor.about} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>

              <div className="glass p-8 md:p-12 rounded-[3rem] space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Award size={24} className="text-primary" /> Education & Qualifications
                </h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/10">
                  {[
                    { year: "2010 - 2013", title: "DM in Cardiology", school: "Johns Hopkins University" },
                    { year: "2005 - 2009", title: "MD in Internal Medicine", school: "Harvard Medical School" },
                    { year: "2000 - 2004", title: "MBBS", school: "Stanford School of Medicine" },
                  ].map((edu, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-xs font-bold text-primary mb-1">{edu.year}</p>
                      <h4 className="font-bold text-slate-900">{edu.title}</h4>
                      <p className="text-sm text-slate-500">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[3.5rem] shadow-2xl sticky top-28 border-2 border-primary/20 bg-white">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Schedule Appointment</h3>
              
              <div className="space-y-8">
                {/* Date Selection Mock */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Available Dates</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {["Mon 12", "Tue 13", "Wed 14", "Thu 15"].map((date, i) => (
                      <button key={i} className={cn(
                        "flex flex-col items-center justify-center min-w-[80px] p-4 rounded-3xl transition-all border-2",
                        i === 0 ? "bg-primary border-primary text-white shadow-xl scale-105" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-primary/30"
                      )}>
                        <span className="text-xs font-bold opacity-80">{date.split(" ")[0]}</span>
                        <span className="text-lg font-black">{date.split(" ")[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Mock */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Available Slots</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"].map((time, i) => (
                      <button key={i} className={cn(
                        "py-3 rounded-2xl text-xs font-bold border-2 transition-all",
                        i === 1 ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-600 hover:border-primary/20"
                      )}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Total Consultation</span>
                    <span className="text-2xl font-black text-slate-900">{doctor.fee}</span>
                  </div>
                  <Link to="/booking">
                    <Button className="w-full py-5 text-xl rounded-3xl" size="lg">Confirm & Book</Button>
                  </Link>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
                    100% Secure Payment & Free Cancellation
                  </p>
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="glass p-8 rounded-[3rem] bg-gradient-to-br from-primary/5 to-secondary/5">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Working Hours
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mon - Fri</span>
                  <span className="font-bold text-slate-900">09:00 AM - 06:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Saturday</span>
                  <span className="font-bold text-slate-900">10:00 AM - 02:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sunday</span>
                  <span className="font-bold text-red-500 uppercase tracking-widest text-xs">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
