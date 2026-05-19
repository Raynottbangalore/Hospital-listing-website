import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  Activity,
  FileText,
  Phone,
  Building2
} from "lucide-react";
import toast from "react-hot-toast";

export const HospitalDashboard = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchHospitalDashboardData = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      // 1. Fetch user document to find hospitalId
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      let hospitalId = "";
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setHospitalInfo(userData);
        hospitalId = userData.hospitalId;
      }

      if (hospitalId) {
        // 2. Fetch hospital details
        const hospSnap = await getDoc(doc(db, "hospitals", hospitalId));
        if (hospSnap.exists()) {
          setHospitalInfo(prev => ({ ...prev, ...hospSnap.data() }));
        }

        // 3. Fetch doctors count
        const doctorsSnap = await getDocs(collection(db, "hospitals", hospitalId, "doctors"));
        setDoctorsCount(doctorsSnap.size);
        const feeMap = {};
        doctorsSnap.forEach(dDoc => {
          feeMap[dDoc.id] = dDoc.data().fee || "";
        });
        setDoctorsMap(feeMap);

        // 4. Fetch appointments for this hospital
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("hospitalId", "==", hospitalId));
        const appointmentsSnap = await getDocs(q);

        const list = appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAppointments(list);
      }
    } catch (error) {
      console.error("Error fetching hospital dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalDashboardData();
  }, [currentUser]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const aptRef = doc(db, "appointments", appointmentId);
      await updateDoc(aptRef, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      fetchHospitalDashboardData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || (apt.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalDoctors: doctorsCount,
    totalAppointments: appointments.length,
    pending: appointments.filter(a => (a.status || "Pending").toLowerCase() === "pending").length,
    completed: appointments.filter(a => (a.status || "").toLowerCase() === "completed").length,
    revenue: appointments.filter(a => (a.status || "").toLowerCase() === "completed")
                         .reduce((acc, curr) => {
                           let feeStr = curr.consultationFee != null ? curr.consultationFee : (curr.fee != null ? curr.fee : "");
                           if (!feeStr && curr.doctorId && doctorsMap[curr.doctorId]) {
                             feeStr = doctorsMap[curr.doctorId];
                           }
                           if (!feeStr) feeStr = "50";
                           const numericFee = parseInt(String(feeStr).replace(/[^0-9]/g, ""), 10);
                           return acc + (isNaN(numericFee) ? 50 : numericFee);
                         }, 0)
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-primary p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-teal-200">
            <Building2 size={14} /> Hospital Administration Hub
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Welcome, {hospitalInfo?.name || "Hospital Portal"}</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Monitor hospital activities, coordinate with clinical doctors, and manage patient bookings and department performance.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Doctors</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalDoctors}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
            <CalendarDays size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalAppointments}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <Clock size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pending}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.completed}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
            <DollarSign size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">${stats.revenue}</h3>
          </div>
        </motion.div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Patient Bookings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track and manage appointments at your hospital</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search patient, doctor, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Patient Info</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Assigned Doctor</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Reason / Notes</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No bookings found matching your search.
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
                          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-slate-400 font-black text-sm shrink-0 shadow-sm">
                            {(apt.patientName || "P")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm leading-tight">
                              {apt.patientName || "Unknown Patient"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone size={12} /> {apt.patientPhone || "No phone provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white block text-sm leading-tight">
                          {apt.doctorName || "Unassigned"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {apt.category || "General Practitioner"}
                        </span>
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
