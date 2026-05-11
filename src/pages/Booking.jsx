import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hospital, User, Calendar, CreditCard, 
  CheckCircle, ArrowRight, ArrowLeft,
  Search, MapPin, Star, Clock
} from "lucide-react";
import { Button } from "../components/common/Button";
import { hospitals } from "../data/hospitals";
import { doctors } from "../data/doctors";

const steps = [
  { id: 1, name: "Select Hospital", icon: Hospital },
  { id: 2, name: "Choose Doctor", icon: User },
  { id: 3, name: "Date & Time", icon: Calendar },
  { id: 4, name: "Confirmation", icon: CheckCircle },
];

export const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selection, setSelection] = useState({
    hospital: null,
    doctor: null,
    date: null,
    time: null,
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-16 relative">
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-lg",
                  currentStep >= step.id ? "bg-primary text-white scale-110" : "glass text-slate-400"
                )}>
                  <step.icon size={24} />
                </div>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest hidden sm:block",
                  currentStep >= step.id ? "text-primary" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          {/* Progress Line */}
          <div className="absolute top-7 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep - 1) * 33.33}%` }}
              className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow"
            >
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Select a Hospital</h2>
                    <p className="text-slate-500">Choose the medical facility that suits your needs.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hospitals.map(h => (
                      <div 
                        key={h.id}
                        onClick={() => { setSelection({ ...selection, hospital: h }); nextStep(); }}
                        className={cn(
                          "p-4 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 group",
                          selection.hospital?.id === h.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/20"
                        )}
                      >
                        <img src={h.image} className="w-20 h-20 rounded-2xl object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{h.name}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {h.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Choose Your Specialist</h2>
                    <p className="text-slate-500">Select an expert doctor for your consultation.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.map(d => (
                      <div 
                        key={d.id}
                        onClick={() => { setSelection({ ...selection, doctor: d }); nextStep(); }}
                        className={cn(
                          "p-4 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 group",
                          selection.doctor?.id === d.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/20"
                        )}
                      >
                        <img src={d.image} className="w-20 h-20 rounded-2xl object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{d.name}</h4>
                          <p className="text-xs text-primary font-bold">{d.specialization}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Schedule Your Visit</h2>
                    <p className="text-slate-500">Pick a date and time that works for you.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
                      {[...Array(7)].map((_, i) => (
                        <button key={i} className={cn(
                          "p-4 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all",
                          i === 2 ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}>
                          <span className="text-[10px] font-bold">MON</span>
                          <span className="text-lg font-black">{12 + i}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                      {["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM"].map((time, i) => (
                        <button key={i} onClick={() => { setSelection({...selection, time}); nextStep(); }} className={cn(
                          "py-4 rounded-2xl border-2 font-bold transition-all",
                          selection.time === time ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-600"
                        )}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-8">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Booking Confirmed!</h2>
                  <div className="glass p-8 rounded-[2.5rem] bg-slate-50/50 max-w-md mx-auto space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Hospital</span>
                      <span className="font-bold text-slate-900">{selection.hospital?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Doctor</span>
                      <span className="font-bold text-slate-900">{selection.doctor?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Date & Time</span>
                      <span className="font-bold text-primary">May 14, 2024 • {selection.time || "11:00 AM"}</span>
                    </div>
                  </div>
                  <Button size="lg" className="px-12" onClick={() => window.location.href = "/"}>Go to Home</Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="gap-2 font-bold disabled:opacity-0"
              >
                <ArrowLeft size={18} /> Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="gap-2 px-10"
              >
                Next <ArrowRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
