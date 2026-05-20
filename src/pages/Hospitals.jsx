import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, LayoutGrid, SlidersHorizontal, ArrowUpDown, Search, MapPin } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { HospitalCard } from "../components/hospitals/HospitalCard";
import { FilterSidebar } from "../components/hospitals/FilterSidebar";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";
import { cn } from "../utils/cn";

export const Hospitals = () => {
  const location = useLocation();
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalSpecs, setHospitalSpecs] = useState({}); // hospitalId -> [specializations]
  const [offers, setOffers] = useState([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState(location.state?.search || "");
  const [selectedLocations, setSelectedLocations] = useState(
    location.state?.location ? [location.state.location] : []
  );
  const [selectedSpecs, setSelectedSpecs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [querySnapshot, offersSnap] = await Promise.all([
          getDocs(collection(db, "hospitals")),
          getDocs(collection(db, "offers"))
        ]);
        
        const activeOffers = offersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(o => o.active);
        setOffers(activeOffers);

        const hospitalData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHospitals(hospitalData);

        // Normalize initial location from Hero to match available locations
        if (location.state?.location) {
          const heroLoc = location.state.location.toLowerCase();
          const matchedLoc = hospitalData.find(h => h.location?.toLowerCase() === heroLoc)?.location;
          if (matchedLoc) {
            setSelectedLocations([matchedLoc]);
          }
        }

        // Fetch all doctors to get actual specializations per hospital
        const specMap = {};
        for (const hDoc of hospitalData) {
          const dSnap = await getDocs(collection(db, "hospitals", hDoc.id, "doctors"));
          const specs = [...new Set(dSnap.docs.map(d => d.data().category))].filter(Boolean);
          specMap[hDoc.id] = specs;
        }
        setHospitalSpecs(specMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dynamic filter options
  const availableLocations = useMemo(() => {
    return [...new Set(hospitals.map(h => h.location))].filter(Boolean).sort();
  }, [hospitals]);

  const availableSpecs = useMemo(() => {
    const allSpecs = new Set();
    Object.values(hospitalSpecs).forEach(specs => specs.forEach(s => allSpecs.add(s)));
    return [...allSpecs].sort();
  }, [hospitalSpecs]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = !searchQuery || h.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => h.location?.toLowerCase().includes(loc.toLowerCase()));

      const specs = hospitalSpecs[h.id] || [];
      const matchesSpec = selectedSpecs.length === 0 || selectedSpecs.some(s => specs.includes(s));

      return matchesSearch && matchesLocation && matchesSpec;
    });
  }, [hospitals, hospitalSpecs, searchQuery, selectedLocations, selectedSpecs]);

  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={fadeIn("down", 0.1)}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find the Best <span className="text-gradient">Hospitals</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Discover top-rated medical facilities equipped with modern technology and expert care.
          </p>
        </motion.div>

        {/* Mobile Filters (Always Visible on Small Screens) */}
        <div className="lg:hidden space-y-6 mb-12">
          <div className="glass p-4 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-4 shadow-lg">
            <div className="flex items-center gap-3 px-6 py-4 flex-1 w-full bg-white/50 rounded-2xl">
              <Search className="text-primary" size={20} />
              <input 
                type="text" 
                placeholder="Search hospital name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-700 font-medium"
              />
            </div>
            <div className="flex items-center gap-3 px-6 py-4 w-full md:w-64 bg-white/50 rounded-2xl">
              <MapPin className="text-primary" size={20} />
              <select 
                value={selectedLocations[0] || "All Locations"}
                onChange={(e) => setSelectedLocations(e.target.value === "All Locations" ? [] : [e.target.value])}
                className="bg-transparent border-none outline-none w-full text-slate-700 font-medium cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                {availableLocations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setSelectedSpecs([])}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
                selectedSpecs.length === 0 ? "bg-primary text-white shadow-lg" : "glass text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              All Specializations
            </button>
            {availableSpecs.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  if (selectedSpecs.includes(spec)) {
                    setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
                  } else {
                    setSelectedSpecs([...selectedSpecs, spec]);
                  }
                }}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
                  selectedSpecs.includes(spec) ? "bg-primary text-white shadow-lg" : "glass text-slate-600 hover:bg-primary/10 hover:text-primary"
                )}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-10">
          {/* Sidebar */}
          <motion.div
            variants={fadeIn("right", 0.2)}
            initial="hidden"
            animate="show"
            className="hidden lg:block"
          >
            <FilterSidebar 
              locations={availableLocations}
              specializations={availableSpecs}
              selectedLocations={selectedLocations}
              setSelectedLocations={setSelectedLocations}
              selectedSpecs={selectedSpecs}
              setSelectedSpecs={setSelectedSpecs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              className="sticky top-28"
            />
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-3xl">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-sm font-bold text-slate-500">Showing {filteredHospitals.length} Results</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={view === "grid" ? "primary" : "ghost"} 
                    size="sm" 
                    onClick={() => setView("grid")}
                    className="p-2"
                  >
                    <LayoutGrid size={18} />
                  </Button>
                  <Button 
                    variant={view === "list" ? "primary" : "ghost"} 
                    size="sm" 
                    onClick={() => setView("list")}
                    className="p-2"
                  >
                    <List size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                  <ArrowUpDown size={16} /> <span className="hidden xs:inline">Sort:</span> Popularity
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className={view === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-6"}>
              {loading ? (
                // Skeleton UI
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-slate-200 animate-pulse rounded-[2rem]" />
                ))
              ) : (
                <AnimatePresence>
                  {filteredHospitals.map((hospital) => {
                    const hospitalOffer = offers.find(o => o.hospitalId === hospital.id) || offers.find(o => !o.hospitalId);
                    return (
                      <HospitalCard 
                        key={hospital.id} 
                        hospital={hospital} 
                        specializations={hospitalSpecs[hospital.id] || []}
                        offer={hospitalOffer}
                      />
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Empty State */}
            {!loading && filteredHospitals.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No hospitals found</h3>
                <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
                <Button 
                  variant="ghost" 
                  className="mt-4 text-primary font-bold"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocations([]);
                    setSelectedSpecs([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
