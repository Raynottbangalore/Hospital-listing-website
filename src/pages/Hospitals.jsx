import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, LayoutGrid, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { hospitals } from "../data/hospitals";
import { HospitalCard } from "../components/hospitals/HospitalCard";
import { FilterSidebar } from "../components/hospitals/FilterSidebar";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";

export const Hospitals = () => {
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

        <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-10">
          {/* Sidebar */}
          <motion.div
            variants={fadeIn("right", 0.2)}
            initial="hidden"
            animate="show"
            className="hidden lg:block"
          >
            <FilterSidebar />
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-3xl">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-sm font-bold text-slate-500">Showing {hospitals.length} Results</span>
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
                <Button variant="primary" size="sm" className="lg:hidden gap-2 flex-1 sm:flex-none">
                  <SlidersHorizontal size={16} /> Filters
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
                  {hospitals.map((hospital) => (
                    <HospitalCard key={hospital.id} hospital={hospital} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {!loading && (
              <div className="flex justify-center pt-10">
                <div className="flex items-center gap-2 glass p-2 rounded-2xl">
                  {[1, 2, 3, "...", 10].map((page, i) => (
                    <button
                      key={i}
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold transition-all",
                        page === 1 ? "bg-primary text-white" : "text-slate-500 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
