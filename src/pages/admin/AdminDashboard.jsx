import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Building2, 
  Stethoscope, 
  Users, 
  CalendarDays,
  Activity
} from "lucide-react";

export const AdminDashboard = () => {
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
             {loading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)
             ) : (
               <div className="text-center py-8 text-slate-500">No recent activity</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
