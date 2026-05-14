import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Filter, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { DoctorCard } from "../components/doctors/DoctorCard";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";

export const Doctors = () => {
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
        const catSnap = await getDocs(collection(db, "categories"));
        setSpecializations(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Doctors and Locations from all hospitals
        const hospitalsSnap = await getDocs(collection(db, "hospitals"));
        const allDoctors = [];
        const allLocations = new Set();
        
        for (const hDoc of hospitalsSnap.docs) {
          const hData = hDoc.data();
          if (hData.location) allLocations.add(hData.location);
          if (hData.address) allLocations.add(hData.address);
          
          const dSnap = await getDocs(collection(db, "hospitals", hDoc.id, "doctors"));
          allDoctors.push(...dSnap.docs.map(d => ({ 
            id: d.id, 
            hospitalId: hDoc.id, 
            hospitalName: hData.name,
            hospitalLocation: hData.location || hData.address,
            ...d.data() 
          })));
        }
        setDoctors(allDoctors);
        setLocations(Array.from(allLocations).sort());

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpec = selectedSpec === "All" || doctor.category === selectedSpec;
    const matchesSearch = !searchQuery || 
      doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doctor.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "All Locations" || 
      doctor.hospitalLocation === selectedLocation;
      
    return matchesSpec && matchesSearch && matchesLocation;
  });


  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeIn("down", 0.1)}
          initial="hidden"
          animate="show"
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Meet Our <span className="text-gradient">Specialists</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Our doctors are world-class experts in their fields, dedicated to providing compassionate and advanced healthcare.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="glass p-4 rounded-[2.5rem] mb-12 flex flex-col md:flex-row items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3 px-6 py-4 flex-1 w-full bg-white/50 rounded-2xl">
            <Search className="text-primary" size={20} />
            <input 
              type="text" 
              placeholder="Search by doctor name or specialization..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-700 font-medium"
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-4 w-full md:w-64 bg-white/50 rounded-2xl">
            <MapPin className="text-primary" size={20} />
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-700 font-medium cursor-pointer"
            >
              <option value="All Locations">All Locations</option>
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <Button className="w-full md:w-auto h-full px-8 py-4">Search</Button>
        </div>


        {/* Specialization Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-8 hide-scrollbar">
          <button
            onClick={() => setSelectedSpec("All")}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
              selectedSpec === "All" ? "bg-primary text-white shadow-lg" : "glass text-slate-600 hover:bg-primary/10 hover:text-primary"
            )}
          >
            All Specialists
          </button>
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpec(spec.name)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
                selectedSpec === spec.name ? "bg-primary text-white shadow-lg" : "glass text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              {spec.name}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-[2.5rem]" />
             ))
          ) : (
            filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                variants={fadeIn("up", index * 0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
