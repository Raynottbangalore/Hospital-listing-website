import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, User, Hospital, 
  MapPin, Activity, CheckCircle2, 
  Clock3, AlertCircle, ChevronRight, XCircle
} from "lucide-react";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { cn } from "../utils/cn";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const MyBookings = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser.uid)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const sorted = docs.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setAppointments(sorted);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(appointmentId);
    try {
      const aptRef = doc(db, "appointments", appointmentId);
      await deleteDoc(aptRef);
      
      toast.success("Appointment cancelled successfully");
      // Refresh the list
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="section-padding min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-500 font-medium">View and manage your scheduled doctor appointments.</p>
        </header>

        {loading && !cancellingId ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 w-full bg-white animate-pulse rounded-[2.5rem] border border-slate-100" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass py-24 px-12 text-center rounded-[3.5rem] bg-white border border-white shadow-xl"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-slate-300" size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't scheduled any appointments. Find a doctor or hospital to get started.</p>
            <Button size="lg" onClick={() => navigate("/hospitals")} className="rounded-2xl px-12">Book Now</Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {appointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "glass p-6 md:p-8 rounded-[2.5rem] bg-white border border-white shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative",
                    apt.status === "Cancelled" && "opacity-60"
                  )}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row gap-6 md:items-center relative z-10">
                    {/* Doctor Info */}
                    <div className="flex items-center gap-5 flex-grow">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            apt.status === "Confirmed" ? "bg-green-100 text-green-600" : 
                            apt.status === "Cancelled" ? "bg-red-100 text-red-600" :
                            "bg-amber-100 text-amber-600"
                          )}>
                            {apt.status || "Pending"}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                          {apt.doctorName}
                        </h3>
                        <p className="text-sm font-bold text-primary flex items-center gap-1 mt-0.5">
                          <Activity size={14} /> {apt.category}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-16 bg-slate-100" />

                    {/* Details */}
                    <div className="grid grid-cols-2 md:flex md:flex-col gap-4 md:gap-2 md:min-w-[200px]">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Hospital size={10} /> Hospital
                        </p>
                        <p className="text-sm font-bold text-slate-700">{apt.hospitalName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> Schedule
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="text-slate-400 font-medium ml-2">@ {apt.time}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {apt.status !== "Cancelled" ? (
                        <Button 
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancellingId === apt.id}
                          variant="outline" 
                          size="sm" 
                          className="flex-1 md:w-32 rounded-xl text-xs font-black border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                        >
                          {cancellingId === apt.id ? "..." : "Cancel"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 px-4 py-2 bg-red-50 rounded-xl">
                          <XCircle size={16} />
                          <span className="text-xs font-black uppercase tracking-widest">Cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-12 p-8 glass rounded-[3rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold mb-1">Need another consultation?</h4>
            <p className="text-slate-400 text-sm">Book with a different specialist or find another hospital.</p>
          </div>
          <Button onClick={() => navigate("/hospitals")} variant="secondary" className="px-10 rounded-2xl whitespace-nowrap">
            Book New Appointment
          </Button>
        </div>
      </div>
    </div>
  );
};
