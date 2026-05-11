import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, Phone, Globe, 
  Share2, Heart, ShieldCheck, CheckCircle2,
  Calendar, Users, Info, MessageSquare
} from "lucide-react";
import { hospitals } from "../data/hospitals";
import { doctors } from "../data/doctors";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";
import { DoctorCard } from "../components/doctors/DoctorCard";

export const HospitalDetails = () => {
  const { id } = useParams();
  const hospital = hospitals.find(h => h.id === parseInt(id)) || hospitals[0];

  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 font-medium">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/hospitals" className="hover:text-primary">Hospitals</Link>
          <span>/</span>
          <span className="text-slate-900">{hospital.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Gallery / Image */}
            <motion.div
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              animate="show"
              className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px]"
            >
              <img 
                src={hospital.image} 
                alt={hospital.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 flex gap-3">
                <button className="glass p-3 rounded-2xl hover:bg-white transition-colors">
                  <Share2 size={20} className="text-slate-700" />
                </button>
                <button className="glass p-3 rounded-2xl hover:bg-red-50 text-red-500 transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </motion.div>

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">Multi-Specialty</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900">{hospital.rating}</span>
                    <span className="text-slate-400">({hospital.reviews} Reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{hospital.name}</h1>
                <div className="flex items-center gap-6 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <span>{hospital.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <span>{hospital.status} Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="glass p-8 md:p-12 rounded-[3rem] space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info size={24} className="text-primary" /> Overview
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {hospital.description} Our hospital is committed to providing exceptional healthcare services with a focus on patient comfort and safety. We utilize the latest medical advancements to ensure the best possible outcomes.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Facilities</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {hospital.facilities.map(item => (
                      <div key={item} className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.departments.map(dept => (
                      <span key={dept} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-primary" /> Specialist Doctors
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {doctors.slice(0, 2).map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[3rem] shadow-2xl sticky top-28 border-2 border-primary/10">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Book Appointment</h3>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="font-bold text-slate-900">$50.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Next Available Slot</span>
                    <span className="font-bold text-green-600">Today, 4:00 PM</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Select Specialization</label>
                    <select className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary">
                      {hospital.departments.map(dept => (
                        <option key={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Preferred Date</label>
                    <input type="date" className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                <Link to="/booking">
                  <Button className="w-full py-4 text-lg" size="lg">Confirm Booking</Button>
                </Link>

                <p className="text-center text-xs text-slate-400 px-4 leading-relaxed">
                  By clicking "Confirm Booking", you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="glass p-8 rounded-[3rem] space-y-6">
              <h4 className="font-bold text-slate-900">Contact Information</h4>
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                  <Phone size={18} className="text-primary" />
                  <span className="text-sm font-medium">{hospital.contact}</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                  <Globe size={18} className="text-primary" />
                  <span className="text-sm font-medium">www.citygeneral.com</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                  <MessageSquare size={18} className="text-primary" />
                  <span className="text-sm font-medium">Chat with us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
