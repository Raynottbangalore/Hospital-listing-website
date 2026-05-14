import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Calendar, Heart, FileText, 
  Settings, LogOut, Bell, Search, User,
  Plus, Clock, MapPin, ChevronRight, Activity, Hospital
} from "lucide-react";
import { Button } from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Appointments");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const q = query(
          collection(db, "appointments"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Appointments", icon: Calendar },
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Favorite Hospitals", icon: Heart },
    { name: "Medical History", icon: FileText },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-80 glass border-r border-slate-200 hidden lg:flex flex-col p-8 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-primary p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900">MediFind</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                activeTab === item.name ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-8 md:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Welcome, {currentUser?.displayName?.split(' ')[0] || "User"}! 👋
            </h1>
            <p className="text-slate-500 font-medium">Manage your appointments and healthcare needs.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="glass p-3 rounded-2xl text-slate-500 hover:text-primary transition-all">
              <Bell size={24} />
            </button>
            <div className="flex items-center gap-3 glass p-2 pr-6 rounded-2xl">
              <img src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}&background=random`} className="w-10 h-10 rounded-xl" />
              <div className="hidden sm:block">
                <p className="text-sm font-black text-slate-900">{currentUser?.displayName || "Profile"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Appointments Section */}
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">My Bookings</h3>
              <Button onClick={() => navigate("/hospitals")} variant="ghost" size="sm" className="font-bold">Book New</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-28 w-full bg-white/50 animate-pulse rounded-[2.5rem]" />
                ))
              ) : appointments.length === 0 ? (
                <div className="text-center py-20 glass rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                  <h4 className="text-xl font-bold text-slate-900">No appointments found</h4>
                  <p className="text-slate-500 mb-6">You haven't booked any appointments yet.</p>
                  <Button onClick={() => navigate("/hospitals")}>Find a Hospital</Button>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="glass p-6 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between hover:border-primary/20 transition-all group bg-white border border-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{apt.doctorName}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Hospital size={12} /> {apt.hospitalName}
                          </p>
                          <p className="text-xs text-primary font-black uppercase tracking-wider">
                            {apt.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 flex items-center justify-end gap-2">
                          <Calendar size={14} className="text-slate-400" /> {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-1 flex items-center justify-end gap-2">
                          <Clock size={14} className="text-slate-400" /> {apt.time}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                          apt.status === "Pending" ? "bg-amber-100 text-amber-600" : 
                          apt.status === "Confirmed" ? "bg-green-100 text-green-600" : 
                          "bg-slate-100 text-slate-500"
                        )}>
                          {apt.status}
                        </span>
                        <Button variant="ghost" size="sm" className="text-[10px] h-8 px-3 rounded-lg hover:bg-slate-100">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Health Stats Sidebar integrated into main flow for better UX */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <h4 className="text-xl font-bold mb-2">Need help?</h4>
              <p className="text-slate-400 text-sm mb-6">Contact our support team for any issues with your bookings.</p>
              <Button className="w-full" variant="secondary">Contact Support</Button>
            </div>
            <div className="glass p-8 rounded-[3rem] bg-primary text-white relative overflow-hidden">
              <h4 className="text-xl font-bold mb-2">Health Tip</h4>
              <p className="text-white/80 text-sm mb-6">Drink at least 8 glasses of water daily to stay hydrated and improve your overall health.</p>
              <Button className="w-full bg-white text-primary hover:bg-white/90">Learn More</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
