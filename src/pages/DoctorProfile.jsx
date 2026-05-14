import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Star, Clock, Briefcase, GraduationCap, MapPin, 
  MessageSquare, Video, Calendar, ArrowLeft,
  ShieldCheck, Award, Heart
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";

export const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const hospitalsSnap = await getDocs(collection(db, "hospitals"));
        let foundDoctor = null;
        for (const hDoc of hospitalsSnap.docs) {
          const dSnap = await getDocs(collection(db, "hospitals", hDoc.id, "doctors"));
          const docMatch = dSnap.docs.find(d => d.id === id);
          if (docMatch) {
            foundDoctor = { 
              id: docMatch.id, 
              hospitalId: hDoc.id, 
              hospitalName: hDoc.data().name,
              hospitalLocation: hDoc.data().location || hDoc.data().address || "Location not specified",
              ...docMatch.data() 
            };
            break;
          }
        }
        setDoctor(foundDoctor);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Doctor not found</h2>
        <Link to="/doctors">
          <Button>Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Experience", value: doctor.experience + " Years", icon: Briefcase },
    { label: "Patients", value: "2,000+", icon: Heart },
    { label: "Reviews", value: doctor.reviews || "150+", icon: MessageSquare },
    { label: "Rating", value: doctor.rating || "4.8", icon: Star },
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
                      {doctor.category || "Specialist"}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">{doctor.name}</h1>
                  <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                    <MapPin size={20} className="text-primary" /> {doctor.hospitalName}{doctor.hospitalLocation ? `, ${doctor.hospitalLocation}` : ""}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-100">
                {stats.filter(s => s.label !== "Rating").map((stat, i) => (
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
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                  {doctor.about || "No information available about this doctor yet."}
                </p>
              </div>

              {(doctor.education || doctor.qualifications) && (
                <div className="glass p-8 md:p-12 rounded-[3rem] space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Award size={24} className="text-primary" /> Education & Qualifications
                  </h3>
                  <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/10">
                    {doctor.education && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg">Education</h4>
                        <p className="text-slate-600 whitespace-pre-line mt-2">{doctor.education}</p>
                      </div>
                    )}
                    {doctor.qualifications && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg">Qualifications & Certifications</h4>
                        <p className="text-slate-600 whitespace-pre-line mt-2">{doctor.qualifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Booking Card */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[3.5rem] shadow-2xl sticky top-28 bg-white border border-white">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-slate-500 font-medium">Consultation Fee</p>
                  <p className="text-4xl font-black text-slate-900">${doctor.fee || "50"}</p>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <Link 
                    to="/booking" 
                    state={{ 
                      doctor: doctor, 
                      hospital: { id: doctor.hospitalId, name: doctor.hospitalName } 
                    }}
                    className="block"
                  >
                    <Button className="w-full py-6 text-xl rounded-[2rem] shadow-xl shadow-primary/20" size="lg">
                      Book Appointment
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-slate-400 font-medium">
                    Instant confirmation after selection
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <ShieldCheck size={20} className="text-primary" />
                    <span className="text-sm font-medium">Verified Healthcare Provider</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={20} className="text-primary" />
                    <span className="text-sm font-medium">Flexible Scheduling</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="glass p-8 rounded-[3rem] bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Working Hours
                </h4>
                {(() => {
                  const now = new Date();
                  const day = now.getDay();
                  const hour = now.getHours();
                  let isOpen = false;
                  
                  if (day >= 1 && day <= 5) { // Mon-Fri: 9AM - 8PM
                    if (hour >= 9 && hour < 20) isOpen = true;
                  } else if (day === 6) { // Sat: 9AM - 2PM
                    if (hour >= 9 && hour <= 14) isOpen = true;
                  }



                  
                  return isOpen ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Open Now
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Closed
                    </span>
                  );
                })()}
              </div>
              
              <div className="space-y-3">
                {[
                  { days: "Mon - Fri", hours: "09:00 AM - 08:00 PM", active: new Date().getDay() >= 1 && new Date().getDay() <= 5 },
                  { days: "Saturday", hours: "09:00 AM - 02:00 PM", active: new Date().getDay() === 6 },
                  { days: "Sunday", hours: "CLOSED", active: new Date().getDay() === 0, closed: true },
                ].map((schedule, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center p-2 rounded-xl transition-all ${schedule.active ? 'bg-white shadow-sm ring-1 ring-primary/20 scale-[1.02]' : 'opacity-70'}`}
                  >
                    <span className={`text-sm ${schedule.active ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{schedule.days}</span>
                    <span className={`text-sm ${schedule.closed ? 'text-red-500 font-bold uppercase tracking-widest text-xs' : schedule.active ? 'font-black text-primary' : 'font-bold text-slate-900'}`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-slate-400 text-center font-medium italic">
                * Timings may vary on public holidays
              </p>
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
