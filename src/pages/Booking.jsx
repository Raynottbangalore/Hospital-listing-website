import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hospital, User, Calendar, CreditCard, 
  CheckCircle, ArrowRight, ArrowLeft,
  Search, MapPin, Star, Clock, Briefcase, 
  DollarSign, ChevronRight, Activity
} from "lucide-react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../components/common/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { cn } from "../utils/cn";
import { toast } from "react-hot-toast";

const steps = [
  { id: 1, name: "Hospital", icon: Hospital },
  { id: 2, name: "Specialization", icon: Activity },
  { id: 3, name: "Doctor", icon: User },
  { id: 4, name: "Schedule", icon: Calendar },
  { id: 5, name: "Confirm", icon: CheckCircle },
];

export const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selection, setSelection] = useState({
    hospital: location.state?.hospital || null,
    specialization: "",
    doctor: location.state?.doctor || null,
    date: null,
    time: null,
  });

  const [patientDetails, setPatientDetails] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    reason: "",
  });

  // Fetch Hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "hospitals"));
        setHospitals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch all doctors for the selected hospital to derive specializations
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!selection.hospital?.id) {
        setAllDoctors([]);
        setSpecializations([]);
        return;
      }
      
      setLoading(true);
      try {
        const doctorsRef = collection(db, "hospitals", selection.hospital.id, "doctors");
        const snap = await getDocs(doctorsRef);
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setAllDoctors(docs);
        
        // Derive unique specializations from available doctors
        const doctorCategories = [...new Set(docs.map(d => d.category).filter(Boolean))];
        const hospitalDepts = selection.hospital.departments || [];
        const combined = [...new Set([...doctorCategories, ...hospitalDepts])].sort();
        
        setSpecializations(combined.length > 0 ? combined : ["General Physician"]);
      } catch (error) {
        console.error("Error fetching hospital data:", error);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalData();
  }, [selection.hospital?.id, selection.hospital?.departments]);

  // Handle initial state from navigation (pre-selected doctor)
  useEffect(() => {
    if (location.state?.doctor && allDoctors.length > 0) {
      const doc = location.state.doctor;
      setSelection(prev => ({ 
        ...prev, 
        doctor: doc,
        specialization: doc.category || doc.specialization
      }));
      setCurrentStep(4);
    } else if (location.state?.hospital && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [location.state, allDoctors]);

  // Filter doctors when specialization changes
  useEffect(() => {
    if (!selection.specialization) {
      setFilteredDoctors([]);
      return;
    }

    const filtered = allDoctors.filter(d => {
      const docCategory = (d.category || "").toLowerCase();
      const selectedSpec = selection.specialization.toLowerCase();
      
      // Smart matching (e.g., Cardiology matches Cardiologist)
      return docCategory === selectedSpec || 
             docCategory.includes(selectedSpec) || 
             selectedSpec.includes(docCategory);
    });

    setFilteredDoctors(filtered);
  }, [selection.specialization, allDoctors]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
        toast.error("Please login to continue");
        navigate("/login", { state: { from: "/booking" } });
        return;
    }

    if (!selection.doctor || !selection.hospital || !selection.date || !selection.time) {
        toast.error("Booking information is incomplete. Please go back and select all details.");
        return;
    }

    setIsSubmitting(true);
    try {
      // Check for existing booking
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser.uid),
        where("doctorId", "==", selection.doctor.id),
        where("date", "==", selection.date),
        where("time", "==", selection.time)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        toast.error("You have already booked this appointment slot!");
        setIsSubmitting(false);
        return;
      }

      const appointmentData = {
        patientName: patientDetails.name,
        patientEmail: patientDetails.email,
        patientPhone: patientDetails.phone,
        reason: patientDetails.reason,
        hospitalId: selection.hospital.id,
        hospitalName: selection.hospital.name,
        doctorId: selection.doctor.id,
        doctorName: selection.doctor.name,
        category: selection.specialization,
        date: selection.date,
        time: selection.time,
        userId: currentUser.uid,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "appointments"), appointmentData);
      toast.success("Appointment booked successfully!");
      setCurrentStep(6); // Success step
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Progress Stepper */}
        <div className="mb-12 relative px-4">
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-xl",
                  currentStep >= step.id ? "bg-primary text-white scale-110" : "glass bg-white text-slate-400"
                )}>
                  <step.icon size={currentStep >= step.id ? 28 : 24} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest hidden sm:block",
                  currentStep >= step.id ? "text-primary" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-6 md:top-8 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min((currentStep - 1) * 25, 100)}%` }}
              className="h-full bg-primary shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Main Booking Content */}
          <div className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl min-h-[550px] flex flex-col bg-white border border-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-grow"
              >
                {/* Step 1: Hospital */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Select Hospital</h2>
                      <p className="text-slate-500">Choose a healthcare facility for your visit.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {loading && hospitals.length === 0 ? (
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />
                        ))
                      ) : (
                        hospitals.map(h => (
                          <div 
                            key={h.id}
                            onClick={() => { setSelection({ ...selection, hospital: h }); nextStep(); }}
                            className={cn(
                              "p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 group bg-slate-50/50",
                              selection.hospital?.id === h.id ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-transparent hover:border-primary/20 hover:bg-white"
                            )}
                          >
                            <img src={h.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">{h.name}</h4>
                              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {h.location}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Specialization */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Choose Specialization</h2>
                      <p className="text-slate-500">What type of care do you need?</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {loading && specializations.length === 0 ? (
                         [...Array(6)].map((_, i) => (
                          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />
                        ))
                      ) : (
                        specializations.map(spec => (
                          <button 
                            key={spec}
                            onClick={() => { setSelection({ ...selection, specialization: spec }); nextStep(); }}
                            className={cn(
                              "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center group bg-slate-50/50",
                              selection.specialization === spec ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-transparent hover:border-primary/20 hover:bg-white"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                              selection.specialization === spec ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                              <Activity size={24} />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{spec}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Doctor */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Select Specialist</h2>
                      <p className="text-slate-500">Choose from our expert doctors in {selection.specialization}.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {loading ? (
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />
                        ))
                      ) : filteredDoctors.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <p className="text-slate-400 font-medium">No doctors available for this specialization.</p>
                          <Button variant="ghost" className="mt-4" onClick={prevStep}>Go Back</Button>
                        </div>
                      ) : (
                        filteredDoctors.map(d => (
                          <div 
                            key={d.id}
                            onClick={() => { setSelection({ ...selection, doctor: d }); nextStep(); }}
                            className={cn(
                              "p-5 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-5 group bg-slate-50/50 relative overflow-hidden",
                              selection.doctor?.id === d.id ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-transparent hover:border-primary/20 hover:bg-white"
                            )}
                          >
                            <img src={d.image} className="w-24 h-24 rounded-3xl object-cover shadow-lg" />
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg truncate">{d.name}</h4>
                              <p className="text-xs text-primary font-black uppercase tracking-wider mb-2">{d.category || selection.specialization}</p>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><Briefcase size={12} /> {d.experience}</span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><Star size={12} className="text-amber-500 fill-amber-500" /> {d.rating || "4.8"}</span>
                              </div>
                            </div>
                            {selection.doctor?.id === d.id && (
                              <div className="absolute top-4 right-4 text-primary">
                                <CheckCircle size={24} />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Date & Time */}
                {currentStep === 4 && (
                  <div className="space-y-10">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Schedule Appointment</h2>
                      <p className="text-slate-500">Select your preferred date and time slot.</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Date</label>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                          {[...Array(10)].map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                            const dayNum = date.getDate();
                            const fullDate = date.toISOString().split('T')[0];
                            
                            return (
                              <button 
                                key={i} 
                                onClick={() => setSelection({...selection, date: fullDate})}
                                className={cn(
                                  "flex-shrink-0 w-20 h-24 rounded-3xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm",
                                  selection.date === fullDate ? "bg-primary border-primary text-white shadow-primary/30 scale-105" : "bg-white border-transparent text-slate-500 hover:border-primary/30"
                                )}
                              >
                                <span className="text-[10px] font-bold tracking-widest">{dayName}</span>
                                <span className="text-2xl font-black">{dayNum}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Time Slot</label>
                        {(() => {
                          if (!selection.date) return <p className="text-sm text-slate-400 italic">Please select a date first</p>;
                          
                          const selectedDate = new Date(selection.date);
                          const day = selectedDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                          
                          if (day === 0) {
                            return (
                              <div className="col-span-full py-6 text-center bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-red-500 font-bold">Closed on Sundays</p>
                              </div>
                            );
                          }

                          const allSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"];
                          
                          // Filter slots based on working hours
                          const filteredSlots = allSlots.filter(time => {
                            const [t, m] = time.split(' ');
                            let [h] = t.split(':').map(Number);
                            if (m === 'PM' && h !== 12) h += 12;
                            if (m === 'AM' && h === 12) h = 0;

                            // Filter slots based on working hours
                            if (day >= 1 && day <= 5) { // Mon-Fri: 9AM - 8PM
                              return h >= 9 && h <= 20;
                            } else if (day === 6) { // Sat: 9AM - 2PM
                              return h >= 9 && h <= 14;
                            }
                            return false;
                          });

                          if (filteredSlots.length === 0) {
                            return (
                              <div className="col-span-full py-6 text-center bg-slate-50 rounded-2xl">
                                <p className="text-slate-400">No available slots for this day.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {filteredSlots.map((time, i) => {
                                const isPast = selection.date === new Date().toISOString().split('T')[0] && (() => {
                                  const now = new Date();
                                  const [t, m] = time.split(' ');
                                  let [h, min] = t.split(':').map(Number);
                                  if (m === 'PM' && h !== 12) h += 12;
                                  if (m === 'AM' && h === 12) h = 0;
                                  const slot = new Date();
                                  slot.setHours(h, min, 0, 0);
                                  return slot < now;
                                })();

                                if (isPast) return null;

                                return (
                                  <button 
                                    key={i} 
                                    onClick={() => setSelection({...selection, time})} 
                                    className={cn(
                                      "py-4 rounded-2xl border-2 font-bold transition-all text-sm",
                                      selection.time === time ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-white border-transparent text-slate-600 hover:border-primary/20"
                                    )}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Details & Confirm */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Final Step</h2>
                      <p className="text-slate-500">Confirm your details and book the appointment.</p>
                    </div>
                    
                    <form onSubmit={handleBookingSubmit} className="space-y-6 max-w-2xl mx-auto">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Patient Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={patientDetails.name}
                            onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                            placeholder="Full Name" 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Contact Number</label>
                          <input 
                            type="tel" 
                            required
                            value={patientDetails.phone}
                            onChange={(e) => setPatientDetails({...patientDetails, phone: e.target.value})}
                            placeholder="+1 (555) 000-0000" 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Reason for Appointment</label>
                        <textarea 
                          rows="4" 
                          required
                          value={patientDetails.reason}
                          onChange={(e) => setPatientDetails({...patientDetails, reason: e.target.value})}
                          placeholder="Briefly describe your health concern..." 
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
                        />
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 6: Success */}
                {currentStep === 6 && (
                  <div className="text-center space-y-8 py-10">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-green-100/50">
                      <CheckCircle size={48} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-slate-900">Appointment Booked!</h2>
                      <p className="text-slate-500 text-lg">Your visit has been successfully scheduled.</p>
                    </div>
                    <div className="glass p-8 rounded-[3rem] bg-slate-50/50 max-w-md mx-auto space-y-4 text-left border border-white shadow-xl">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Hospital</span>
                        <span className="font-bold text-slate-900">{selection.hospital?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Specialist</span>
                        <span className="font-bold text-slate-900">{selection.doctor?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-4 border-t border-slate-200">
                        <span className="text-slate-500 font-medium">Date & Time</span>
                        <span className="font-bold text-primary">{new Date(selection.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {selection.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Button size="lg" className="rounded-2xl" onClick={() => navigate("/dashboard")}>View My Bookings</Button>
                      <Button variant="ghost" size="lg" onClick={() => navigate("/")}>Back to Home</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            {currentStep < 6 && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={currentStep === 1 || isSubmitting}
                  className="gap-2 font-bold px-0 hover:bg-transparent"
                >
                  <ArrowLeft size={18} /> Back
                </Button>
                
                {currentStep === 5 ? (
                  <Button 
                    onClick={handleBookingSubmit} 
                    disabled={isSubmitting || !patientDetails.name || !patientDetails.phone}
                    className="gap-2 px-12 py-5 text-lg shadow-2xl shadow-primary/30 rounded-2xl"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Confirm Booking <ArrowRight size={20} /></>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep} 
                    disabled={
                      (currentStep === 1 && !selection.hospital) ||
                      (currentStep === 2 && !selection.specialization) ||
                      (currentStep === 3 && filteredDoctors.length === 0 && !selection.doctor) ||
                      (currentStep === 4 && (!selection.date || !selection.time))
                    }
                    className="gap-2 px-12 py-5 text-lg rounded-2xl"
                  >
                    Next Step <ArrowRight size={20} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Summary (only visible during steps) */}
          {currentStep > 1 && currentStep < 6 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-28 space-y-6"
            >
              <div className="glass p-8 rounded-[2.5rem] bg-white border border-white shadow-xl space-y-6">
                <h4 className="text-xl font-black text-slate-900">Booking Summary</h4>
                
                <div className="space-y-6">
                  {selection.hospital && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Hospital className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hospital</p>
                        <p className="text-sm font-bold text-slate-900">{selection.hospital.name}</p>
                      </div>
                    </div>
                  )}

                  {selection.specialization && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Specialization</p>
                        <p className="text-sm font-bold text-slate-900">{selection.specialization}</p>
                      </div>
                    </div>
                  )}

                  {selection.doctor && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Doctor</p>
                        <p className="text-sm font-bold text-slate-900">{selection.doctor.name}</p>
                      </div>
                    </div>
                  )}

                  {(selection.date || selection.time) && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Schedule</p>
                        <p className="text-sm font-bold text-slate-900">
                          {selection.date ? new Date(selection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""} 
                          {selection.date && selection.time ? " @ " : ""}
                          {selection.time || ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selection.doctor && (
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Consultation Fee</span>
                    <span className="text-2xl font-black text-primary">{selection.doctor.fee || "$50"}</span>
                  </div>
                )}
              </div>

              <div className="glass p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Slots are filling up fast. Complete your booking within the next 10 minutes to secure your preferred time.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
