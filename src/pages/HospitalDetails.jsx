import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, Phone, Globe, 
  Share2, Heart, ShieldCheck, CheckCircle2,
  Calendar, Users, Info, MessageSquare
} from "lucide-react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";
import { DoctorCard } from "../components/doctors/DoctorCard";
import { useNavigate } from "react-router-dom";

export const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Hospital Details
        const docRef = doc(db, "hospitals", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const hospitalData = { id: docSnap.id, ...docSnap.data() };
          setHospital(hospitalData);

          // Fetch Doctors for this Hospital
          const doctorsSnap = await getDocs(collection(db, "hospitals", id, "doctors"));
          const doctorsData = doctorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHospitalDoctors(doctorsData);

          // Derive Specializations from Doctors
          const derivedSpecs = [...new Set(doctorsData.map(d => {
            const cat = d.category || "";
            // Map "Cardiologist" to "Cardiology", etc. if needed, or just use category
            if (cat.endsWith('ist')) return cat.replace('ist', 'y');
            return cat;
          }))].filter(Boolean);
          
          const combinedSpecs = [...new Set([...derivedSpecs, ...(hospitalData.departments || [])])];
          setSpecializations(combinedSpecs);
        } else {
          console.error("No such hospital!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Hospital not found</h2>
        <Link to="/hospitals">
          <Button>Back to Hospitals</Button>
        </Link>
      </div>
    );
  }

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
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {hospital.emergency ? "Emergency Ready" : "Multi-Specialty"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900">{hospital.rating || "4.5"}</span>
                    <span className="text-slate-400">({hospital.reviews || "120+"} Reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{hospital.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-6 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <span>{hospital.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <span>{hospital.status || "Open"} Now</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button 
                  className="w-full shadow-lg shadow-primary/20 py-4 rounded-2xl lg:hidden"
                  onClick={() => navigate("/booking", { state: { hospital } })}
                >
                  Book Appointment
                </Button>
              </div>
            </div>

            {/* Overview */}
            <div className="glass p-8 md:p-12 rounded-[3rem] space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info size={24} className="text-primary" /> Overview
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {hospital.about || "Our hospital is committed to providing exceptional healthcare services with a focus on patient comfort and safety. We utilize the latest medical advancements to ensure the best possible outcomes."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Clinic Features</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {((hospital.features && hospital.features.length > 0) ? hospital.features : (hospital.facilities || ["24/7 Emergency", "Pharmacy", "ICU", "Laboratory"])).map(item => (
                      <div key={item} className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Departments & Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {specializations.length > 0 ? (
                      specializations.map(dept => (
                        <span key={dept} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
                          {dept}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm italic">No departments listed</span>
                    )}
                  </div>
                </div>
                {(hospital.qualities && hospital.qualities.length > 0) && (
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-slate-900 mb-4">Hospital Qualities</h4>
                    <div className="flex flex-wrap gap-3">
                      {hospital.qualities.map(quality => (
                        <span key={quality} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold border border-primary/20 flex items-center gap-2">
                          <Star size={16} />
                          {quality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Doctors */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-primary" /> Specialist Doctors
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {hospitalDoctors.length > 0 ? (
                  hospitalDoctors.slice(0, 4).map(doctor => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center glass rounded-3xl text-slate-500">
                    No specialist doctors found for this hospital.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[3rem] space-y-6 bg-white border border-white shadow-xl">
              <div className="space-y-4">
                <Button 
                  className="w-full py-6 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                  onClick={() => navigate("/booking", { state: { hospital } })}
                >
                  Book Now
                </Button>
                <p className="text-center text-xs text-slate-400 font-medium">
                  Free cancellation up to 24h before
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <ShieldCheck size={20} className="text-primary" />
                  <span className="text-sm font-medium">Verified Healthcare Provider</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={20} className="text-primary" />
                  <span className="text-sm font-medium">Instant Confirmation</span>
                </div>
              </div>
            </div>


            {/* Contact Info Card */}
            <div className="glass p-8 rounded-[3rem] space-y-6">
              <h4 className="font-bold text-slate-900">Contact Information</h4>
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                  <Phone size={18} className="text-primary" />
                  <span className="text-sm font-medium">{hospital.contact || "+1 (555) 000-0000"}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
