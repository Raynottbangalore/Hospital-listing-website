import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";

export const FilterSidebar = ({ 
  locations = [], 
  specializations = [],
  selectedLocations = [],
  setSelectedLocations,
  selectedSpecs = [],
  setSelectedSpecs,
  searchQuery = "",
  setSearchQuery,
  className
}) => {

  const handleLocationChange = (loc) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(l => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleSpecChange = (spec) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  return (
    <aside className={cn("space-y-8", className)}>
      {/* Search Input */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Search size={18} className="text-primary" /> Search
        </h4>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Hospital name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Location
        </h4>
        <div className="space-y-3">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedLocations.includes(loc)}
                  onChange={() => handleLocationChange(loc)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{loc}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No locations available</p>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" /> Specializations
        </h4>
        <div className="space-y-3">
          {specializations.length > 0 ? (
            specializations.map((spec) => (
              <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedSpecs.includes(spec)}
                  onChange={() => handleSpecChange(spec)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{spec}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No specializations available</p>
          )}
        </div>
      </div>
    </aside>
  );
};

