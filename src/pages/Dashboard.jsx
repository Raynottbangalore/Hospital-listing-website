import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Calendar, Heart, FileText, 
  Settings, LogOut, Bell, Search, User,
  Plus, Clock, MapPin, ChevronRight, Activity, Hospital
} from "lucide-react";
import { Button } from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const appointments = [
  { doctor: "Dr. Sarah Johnson", hospital: "City General", date: "May 14, 2024", time: "10:30 AM", status: "Upcoming" },
  { doctor: "Dr. Michael Chen", hospital: "Brain & Spine", date: "May 10, 2024", time: "02:00 PM", status: "Completed" },
  { doctor: "Dr. Emily Williams", hospital: "St. Mary's", date: "Apr 28, 2024", time: "09:15 AM", status: "Completed" },
];

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Appointments", icon: Calendar },
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
            <h1 className="text-3xl font-black text-slate-900">Welcome, Alex! 👋</h1>
            <p className="text-slate-500 font-medium">Here's what's happening with your health today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="glass p-3 rounded-2xl text-slate-500 hover:text-primary transition-all">
              <Bell size={24} />
            </button>
            <div className="flex items-center gap-3 glass p-2 pr-6 rounded-2xl">
              <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-xl" />
              <div className="hidden sm:block">
                <p className="text-sm font-black text-slate-900">Alex Thompson</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Member</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Total Visits", value: "12", icon: Calendar, color: "bg-blue-500" },
            { label: "Upcoming", value: "01", icon: Clock, color: "bg-teal-500" },
            { label: "Reports", value: "05", icon: FileText, color: "bg-indigo-500" },
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[2.5rem] flex items-center justify-between group hover:translate-y-[-5px] transition-all duration-300">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
          {/* Recent Appointments */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Recent Appointments</h3>
              <Button variant="ghost" size="sm" className="font-bold">View All</Button>
            </div>
            <div className="space-y-4">
              {appointments.map((apt, i) => (
                <div key={i} className="glass p-6 rounded-[2.5rem] flex items-center justify-between hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <User size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{apt.doctor}</h4>
                      <p className="text-xs text-slate-500 font-medium">{apt.hospital} • {apt.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      apt.status === "Upcoming" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {apt.status}
                    </span>
                    <p className="text-xs font-bold text-slate-400">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full py-5 rounded-[2rem] gap-2" variant="outline">
              <Plus size={20} /> Book New Appointment
            </Button>
          </section>

          {/* Quick Actions / Health Cards */}
          <aside className="space-y-8">
            <div className="glass p-8 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <h4 className="text-xl font-bold mb-4">Complete Your Profile</h4>
              <p className="text-slate-400 text-sm mb-6">Completing your profile helps us provide better healthcare recommendations.</p>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-6">
                <div className="w-2/3 h-full bg-primary rounded-full" />
              </div>
              <Button className="w-full" variant="secondary">Finish Setup</Button>
            </div>

            <div className="glass p-8 rounded-[3rem] space-y-6">
              <h4 className="text-xl font-bold text-slate-900">Favorite Hospitals</h4>
              <div className="space-y-4">
                {[
                  { name: "City General", location: "Downtown", rating: 4.8 },
                  { name: "St. Mary's", location: "Westside", rating: 4.9 },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Hospital size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{h.name}</p>
                        <p className="text-xs text-slate-400">{h.location}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
