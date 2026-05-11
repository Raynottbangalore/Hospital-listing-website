import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { specializations } from "../../data/specializations";

export const FilterSidebar = () => {
  return (
    <aside className="space-y-8 sticky top-28">
      {/* Search Input */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Search size={18} className="text-primary" /> Search
        </h4>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Hospital name..." 
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
          {["Downtown", "Westside", "Medical District", "North Suburbs"].map((loc) => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" /> Specializations
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
          {specializations.map((spec) => (
            <label key={spec.id} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{spec.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h4 className="font-bold text-slate-900">Ratings</h4>
        <div className="space-y-3">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="rating" className="w-5 h-5 border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{rating}+ Stars</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
