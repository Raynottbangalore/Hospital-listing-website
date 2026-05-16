import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { CalendarDays, Clock, CheckCircle2, XCircle, Search, Filter, Phone, FileText } from "lucide-react";
import toast from "react-hot-toast";

export const DoctorAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAppointments = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      let docId = "";
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDoctorInfo(data);
        docId = data.doctorId;
      }

      const appointmentsRef = collection(db, "appointments");
      let snap;

      if (docId) {
        const q = query(appointmentsRef, where("doctorId", "==", docId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(appointmentsRef);
      }

      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const myAppointments = docId ? docs : docs.filter(a => 
        a.userEmail === currentUser.email || 
        (doctorInfo && a.doctorName?.toLowerCase() === doctorInfo.name?.toLowerCase())
      );

      myAppointments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setAppointments(myAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const aptRef = doc(db, "appointments", appointmentId);
      await updateDoc(aptRef, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || (apt.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">All Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Comprehensive list of all your patient bookings and medical consultations</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-2xl text-sm border border-primary/20 shadow-sm">
          <CalendarDays size={18} /> {appointments.length} Consultations On Record
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patient name, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Patient Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Appointment Time</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Reason / Symptoms</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No appointments found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusLower = (apt.status || "Pending").toLowerCase();
                  const isCompleted = statusLower === "completed";
                  const isConfirmed = statusLower === "confirmed";
                  const isCancelled = statusLower === "cancelled";

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                            {(apt.patientName || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm sm:text-base leading-tight">
                              {apt.patientName || "Unknown Patient"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone size={12} /> {apt.patientPhone || "No phone provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white block text-sm leading-tight flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-primary" /> {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Clock size={12} /> @ {apt.time}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2">
                            {apt.reason || "General checkup and consultation"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isCompleted ? "bg-green-100 text-green-700 border border-green-200" :
                          isConfirmed ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          isCancelled ? "bg-red-100 text-red-700 border border-red-200" :
                          "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}>
                          {isCompleted && <CheckCircle2 size={12} />}
                          {apt.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isCompleted && !isCancelled && (
                            <>
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Confirmed")}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-colors border border-blue-200/50"
                                >
                                  Confirm
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "Completed")}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 font-bold text-xs rounded-xl transition-colors border border-green-200/50 flex items-center gap-1"
                              >
                                <CheckCircle2 size={14} /> Complete
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "Cancelled")}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs rounded-xl transition-colors border border-red-200/50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1 justify-end">
                              <CheckCircle2 size={14} /> Completed
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-xs font-bold text-red-500 flex items-center gap-1 justify-end">
                              <XCircle size={14} /> Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
