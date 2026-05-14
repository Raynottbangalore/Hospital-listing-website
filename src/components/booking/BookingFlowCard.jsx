import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, Calendar, Clock, User, 
  CheckCircle2, AlertCircle, ArrowLeft,
  Briefcase, DollarSign, Star, Activity
} from "lucide-react";
import { collection, query, where, getDocs, addDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../common/Button";
import { cn } from "../../utils/cn";
import { toast } from "react-hot-toast";

export const BookingFlowCard = ({ hospital }) => {
  const { currentUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  
  const [selection, setSelection] = useState({
    specialization: "",
    doctor: null,
    date: null,
    time: null,
  });

  const [patientDetails, setPatientDetails] = useState({
    name: currentUser?.displayName || "",
    phone: "",
    reason: "",
  });

  // Fetch all doctors for this hospital once to derive specializations
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!hospital?.id) return;
      
      setLoading(true);
      try {
        const doctorsRef = collection(db, "hospitals", hospital.id, "doctors");
        const querySnapshot = await getDocs(doctorsRef);
        
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAllDoctors(docs);
        
        // Derive unique categories/specializations from available doctors
        // We also include hospital.departments as fallback but prioritize categories from doctors
        const doctorCategories = [...new Set(docs.map(d => d.category).filter(Boolean))];
        const hospitalDepts = hospital.departments || [];
        
        // Combine and unique
        const combined = [...new Set([...doctorCategories, ...hospitalDepts])].sort();
        setSpecializations(combined.length > 0 ? combined : ["General Physician"]);
        
      } catch (err) {
        console.error("Error fetching hospital data:", err);
        toast.error("Failed to load hospital data");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [hospital?.id, hospital?.departments]);

  // Filter doctors when specialization changes
  useEffect(() => {
    if (!selection.specialization) {
      setFilteredDoctors([]);
      return;
    }

    // Filter from local allDoctors for instant response and better matching
    const filtered = allDoctors.filter(d => {
      const docCategory = (d.category || "").toLowerCase();
      const selectedSpec = selection.specialization.toLowerCase();
      
      // Smart matching: "Cardiology" matches "Cardiologist", "ENT" matches "ENT Specialist"
      return docCategory === selectedSpec || 
             docCategory.includes(selectedSpec) || 
             selectedSpec.includes(docCategory);
    });

    setFilteredDoctors(filtered);
    
    if (step === 2 && filtered.length === 0) {
      setError(`No doctors currently available for ${selection.specialization}`);
    } else {
      setError(null);
    }
  }, [selection.specialization, allDoctors, step]);

  const handleNext = () => {
    if (step === 1 && !selection.specialization) return;
    if (step === 2 && !selection.doctor) return;
    if (step === 3 && (!selection.date || !selection.time)) return;
    if (step === 4 && (!patientDetails.name || !patientDetails.phone)) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleBooking = async () => {
    if (!currentUser) {
      toast.error("Please login to book an appointment");
      setError("Please login to book an appointment.");
      return;
    }

    setLoading(true);
    try {
      // Check for existing booking for the same user, doctor, date and time
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser.uid),
        where("doctorId", "==", selection.doctor.id),
        where("date", "==", selection.date),
        where("time", "==", selection.time)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("You have already booked this appointment slot!");
        setError("You have already booked this appointment slot.");
        setLoading(false);
        return;
      }

      const appointmentData = {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        doctorId: selection.doctor.id,
        doctorName: selection.doctor.name,
        category: selection.specialization,
        date: selection.date,
        time: selection.time,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        reason: patientDetails.reason,
        consultationFee: selection.doctor.fee || "$50",
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "appointments"), appointmentData);
      toast.success("Appointment booked successfully!");
      setStep(6);
    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("Failed to book appointment. Please try again.");
      toast.error("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelection({
      specialization: "",
      doctor: null,
      date: null,
      time: null,
    });
    setPatientDetails({
      name: currentUser?.displayName || "",
      phone: "",
      reason: "",
    });
    setStep(1);
    setError(null);
  };

  return (
    <div className="glass p-6 md:p-8 rounded-[2.5rem] shadow-2xl sticky top-28 border border-white/20 overflow-hidden">
      {/* Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-900">
            {step === 6 ? "Booking Confirmed" : "Book Appointment"}
          </h3>
          {step < 6 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Step {step}/5
            </span>
          )}
        </div>
        
        {step < 6 && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "20%" }}
              animate={{ width: `${step * 20}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Specialization */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-500 font-medium">Select a specialization to see available doctors.</p>
            <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {loading && specializations.length === 0 ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 w-full bg-slate-50 animate-pulse rounded-2xl" />
                ))
              ) : (
                specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => {
                      setSelection({ ...selection, specialization: spec, doctor: null });
                      setStep(2);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                      selection.specialization === spec 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-slate-50 bg-slate-50/50 hover:border-primary/30 hover:bg-white"
                    )}
                  >
                    <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{spec}</span>
                    <ChevronRight size={18} className={cn(
                      "transition-transform",
                      selection.specialization === spec ? "text-primary translate-x-1" : "text-slate-300"
                    )} />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Doctor Selection */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={18} className="text-slate-600" />
              </button>
              <h4 className="font-bold text-slate-800">Select Doctor</h4>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3 bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="mx-auto text-red-500" size={32} />
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>Choose Another</Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelection({ ...selection, doctor })}
                    className={cn(
                      "p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group relative",
                      selection.doctor?.id === doctor.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-white"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <img 
                        src={doctor.image} 
                        alt={doctor.name} 
                        className="w-16 h-16 rounded-xl object-cover" 
                      />
                      {doctor.available && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h5 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                        {doctor.name}
                      </h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <Briefcase size={12} /> {doctor.experience || "5y"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-primary font-black uppercase">
                          <DollarSign size={12} /> {doctor.fee || "$50"}
                        </span>
                      </div>
                    </div>
                    {selection.doctor?.id === doctor.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={16} className="text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full mt-4" 
              disabled={!selection.doctor || loading}
              onClick={handleNext}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={18} className="text-slate-600" />
              </button>
              <h4 className="font-bold text-slate-800">Select Date & Time</h4>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Available Dates</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[...Array(10)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const fullDate = date.toISOString().split('T')[0];
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelection({ ...selection, date: fullDate })}
                      className={cn(
                        "flex-shrink-0 w-14 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all",
                        selection.date === fullDate
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-primary/30"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase">{dayName}</span>
                      <span className="text-lg font-black">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Available Slots</label>
              <div className="grid grid-cols-2 gap-2">
                {["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM"].map((time) => {
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
                      key={time}
                      onClick={() => setSelection({ ...selection, time })}
                      className={cn(
                        "py-3 rounded-xl border-2 font-bold text-sm transition-all",
                        selection.time === time
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-primary/30"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button 
              className="w-full mt-2" 
              disabled={!selection.date || !selection.time}
              onClick={handleNext}
            >
              Continue to Details
            </Button>
          </motion.div>
        )}

        {/* Step 4: Patient Details */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={18} className="text-slate-600" />
              </button>
              <h4 className="font-bold text-slate-800">Patient Details</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-slate-700"
                  placeholder="Enter patient's name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({...patientDetails, phone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-slate-700"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Visit (Optional)</label>
                <textarea 
                  value={patientDetails.reason}
                  onChange={(e) => setPatientDetails({...patientDetails, reason: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-slate-700 resize-none h-24"
                  placeholder="Briefly describe the symptoms"
                />
              </div>
            </div>

            <Button 
              className="w-full mt-2" 
              disabled={!patientDetails.name || !patientDetails.phone}
              onClick={handleNext}
            >
              Review Summary
            </Button>
          </motion.div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={18} className="text-slate-600" />
              </button>
              <h4 className="font-bold text-slate-800">Booking Summary</h4>
            </div>

            <div className="bg-slate-50/80 rounded-[2rem] p-5 space-y-4 border border-white">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                <img src={selection.doctor?.image} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h5 className="font-bold text-slate-900 leading-tight">{selection.doctor?.name}</h5>
                  <p className="text-xs text-primary font-bold">{selection.specialization}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>Appointment Details</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500 font-medium"><Calendar size={14} /> Date</span>
                  <span className="font-bold text-slate-900">{new Date(selection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500 font-medium"><Clock size={14} /> Time</span>
                  <span className="font-bold text-slate-900">{selection.time}</span>
                </div>
                
                <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-200/50">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    <span>Patient Details</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Name</span>
                    <span className="font-bold text-slate-900">{patientDetails.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Phone</span>
                    <span className="font-bold text-slate-900">{patientDetails.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200/50">
                  <span className="text-slate-500 font-medium">Consultation Fee</span>
                  <span className="text-lg font-black text-primary">{selection.doctor?.fee || "$50"}</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold text-center px-4">{error}</p>
            )}

            <Button 
              className="w-full py-4 shadow-xl shadow-primary/20" 
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Confirm & Pay"
              )}
            </Button>

            <p className="text-[10px] text-center text-slate-400 px-4 leading-relaxed">
              By confirming, you agree to our terms of service. You will be notified via email once confirmed.
            </p>
          </motion.div>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100/50">
              <CheckCircle2 size={40} />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900">Great Success!</h4>
              <p className="text-sm text-slate-500">Your appointment with <span className="font-bold text-slate-700">{selection.doctor?.name}</span> has been booked.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2">
              <p className="flex justify-between">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono font-bold text-slate-600">#BK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-slate-600">{selection.date} at {selection.time}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={resetSelection}>Book Another</Button>
              <Button variant="ghost" onClick={() => window.location.href = "/dashboard"}>View My Bookings</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
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
