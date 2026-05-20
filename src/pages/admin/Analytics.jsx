import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { motion } from "framer-motion";
import { Activity, Users, CalendarDays, TrendingUp, Building2, Stethoscope, BarChart3, Clock } from "lucide-react";

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeOffers: 0
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const hospitalsSnap = await getDocs(collection(db, "hospitals"));
        const appointmentsSnap = await getDocs(collection(db, "appointments"));
        const offersSnap = await getDocs(collection(db, "offers"));
        
        let totalDocs = 0;
        for (const doc of hospitalsSnap.docs) {
          const docsSnap = await getDocs(collection(db, "hospitals", doc.id, "doctors"));
          totalDocs += docsSnap.size;
        }

        const activeOffers = offersSnap.docs.filter(d => d.data().active).length;

        setStats({
          totalUsers: usersSnap.size,
          totalHospitals: hospitalsSnap.size,
          totalDoctors: totalDocs,
          totalAppointments: appointmentsSnap.size,
          activeOffers: activeOffers
        });
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const statCards = [
    { title: "Platform Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
    { title: "Registered Hospitals", value: stats.totalHospitals, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+5%" },
    { title: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-teal-600", bg: "bg-teal-50", trend: "+8%" },
    { title: "Appointments booked", value: stats.totalAppointments, icon: CalendarDays, color: "text-rose-600", bg: "bg-rose-50", trend: "+24%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500">Monitor your platform's growth and activity</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 text-sm font-medium">
          <Clock size={16} />
          Last 30 Days
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mb-1" />
              ) : (
                <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
              )}
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Activity size={20} />
              </div>
              Platform Engagement
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Appointment Booking Rate</span>
                <span className="text-purple-600 font-bold">68%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Active Offers Utilization</span>
                <span className="text-blue-600 font-bold">42%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Hospital Profile Completion</span>
                <span className="text-emerald-600 font-bold">91%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "91%" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Stats Component */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mt-32 -mr-32 blur-3xl" />
          
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-lg">
              <BarChart3 size={20} />
            </div>
            System Health & Reports
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Active Offers</p>
              <h4 className="text-2xl font-black text-white">{stats.activeOffers}</h4>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Conversion</p>
              <h4 className="text-2xl font-black text-white">4.2%</h4>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Server Uptime</p>
              <h4 className="text-2xl font-black text-emerald-400">99.9%</h4>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Avg Rating</p>
              <h4 className="text-2xl font-black text-yellow-400">4.8/5</h4>
            </div>
          </div>

          <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/10 text-sm">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  );
};
