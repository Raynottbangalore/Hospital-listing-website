import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { Search, Filter, CalendarDays, Clock, Phone, FileText, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export const HospitalAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hospitalId, setHospitalId] = useState("");

  const fetchAppointments = async (hId) => {
    setLoading(true);
    try {
      const q = query(collection(db, "appointments"), where("hospitalId", "==", hId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setAppointments(list);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHospitalId = async () => {
      if (!currentUser?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().hospitalId) {
          const hId = userDoc.data().hospitalId;
          setHospitalId(hId);
          fetchAppointments(hId);
        }
      } catch (err) {
        console.error("Error fetching hospital ID:", err);
      }
    };
    fetchHospitalId();
  }, [currentUser]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { status: newStatus });
      toast.success(`Appointment status updated to ${newStatus}`);
      if (hospitalId) {
        fetchAppointments(hospitalId);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update appointment status");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hospital Bookings</h1>
        <p className="text-slate-500">Track, confirm, complete, or cancel appointments registered at your facility</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-grow max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient, doctor, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white font-semibold cursor-pointer"
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
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Specialist / Doctor</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Schedule</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Reason</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No appointments found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusLower = (apt.status || "Pending").toLowerCase();
                  const isCompleted = statusLower === "completed";
                  const isConfirmed = statusLower === "confirmed";
                  const isCancelled = statusLower === "cancelled";

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{apt.patientName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone size={12} /> {apt.patientPhone || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{apt.doctorName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{apt.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">
                          <p className="font-medium flex items-center gap-1.5 text-sm">
                            <CalendarDays size={14} className="text-primary" /> {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock size={12} /> {apt.time}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 line-clamp-2">{apt.reason || "General Consultation"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          isCompleted ? "bg-green-100 text-green-700" :
                          isConfirmed ? "bg-blue-100 text-blue-700" :
                          isCancelled ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {apt.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isCompleted && !isCancelled && (
                            <>
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Confirmed")}
                                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "Completed")}
                                className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} /> Complete
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, "Cancelled")}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1 justify-end">
                              <CheckCircle2 size={12} /> Completed
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-xs font-bold text-red-500 flex items-center gap-1 justify-end">
                              <XCircle size={12} /> Cancelled
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
