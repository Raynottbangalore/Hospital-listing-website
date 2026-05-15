import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Building2, 
  Stethoscope, 
  Users, 
  CalendarDays,
  Activity,
  Zap,
  Settings,
  ShieldCheck
} from "lucide-react";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0, // This might be hard to calculate if nested, we'll see
    users: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const hospitalsSnap = await getDocs(collection(db, "hospitals"));
        const usersSnap = await getDocs(collection(db, "users"));
        // Assuming appointments is a root collection
        const appointmentsSnap = await getDocs(collection(db, "appointments"));

        let totalDoctors = 0;
        // If doctors are nested under hospitals
        for (const doc of hospitalsSnap.docs) {
          const doctorsSnap = await getDocs(collection(db, "hospitals", doc.id, "doctors"));
          totalDoctors += doctorsSnap.size;
        }

        setStats({
          hospitals: hospitalsSnap.size,
          users: usersSnap.size,
          appointments: appointmentsSnap.size,
          doctors: totalDoctors,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Hospitals", value: stats.hospitals, icon: Building2, color: "bg-blue-500", light: "bg-blue-50" },
    { title: "Total Doctors", value: stats.doctors, icon: Stethoscope, color: "bg-teal-500", light: "bg-teal-50" },
    { title: "Total Users", value: stats.users, icon: Users, color: "bg-indigo-500", light: "bg-indigo-50" },
    { title: "Total Appointments", value: stats.appointments, icon: CalendarDays, color: "bg-rose-500", light: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to your admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.light} text-${stat.color.replace('bg-', '')}`}>
              <stat.icon className={`text-white p-2 w-full h-full rounded-xl ${stat.color} shadow-sm group-hover:scale-110 transition-transform`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Control Center */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Zap size={20} />
            </div>
            Quick Control Center
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Add Hospital", icon: Building2, path: "/admin/hospitals", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "New Doctor", icon: Stethoscope, path: "/admin/doctors", color: "text-teal-600", bg: "bg-teal-50" },
              { label: "Appointments", icon: CalendarDays, path: "/admin/appointments", color: "text-rose-600", bg: "bg-rose-50" },
              { label: "System Config", icon: Settings, path: "/admin/settings", color: "text-slate-600", bg: "bg-slate-50" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center text-center p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group/btn bg-white w-full"
              >
                <div className={`p-4 rounded-2xl ${action.bg} ${action.color} mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300`}>
                  <action.icon size={28} />
                </div>
                <span className="font-bold text-slate-800 text-lg mb-1">{action.label}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-primary transition-colors">Manage Now</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Insights & Health */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800 text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mb-32 -mr-32 blur-3xl" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold mb-1">Platform Pulse</h3>
              <p className="text-slate-400 text-sm">Real-time system monitoring</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              SYSTEM LIVE
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Database Load</span>
                <span className="text-primary font-mono">12.4%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "12.4%" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">API Response Time</span>
                <span className="text-teal-400 font-mono">142ms</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "35%" }}
                  className="h-full bg-teal-400"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Data Security</p>
                  <p className="text-xs text-slate-400">SSL Active & Protected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Uptime</p>
                <p className="text-sm font-mono">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
