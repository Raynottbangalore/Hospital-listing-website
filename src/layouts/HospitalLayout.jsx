import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  Activity
} from "lucide-react";

const hospitalMenuItems = [
  { path: "/hospital/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/hospital/doctors", name: "Manage Doctors", icon: Users },
  { path: "/hospital/appointments", name: "Appointments", icon: CalendarDays },
  { path: "/hospital/profile", name: "Hospital Profile", icon: Building2 },
];

export const HospitalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubHospital = null;

    const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setHospitalInfo(prev => ({ ...prev, ...userData }));

        if (userData.hospitalId) {
          if (!unsubHospital) {
            unsubHospital = onSnapshot(doc(db, "hospitals", userData.hospitalId), (docSnap) => {
              if (docSnap.exists()) {
                setHospitalInfo(prev => ({ ...prev, ...docSnap.data() }));
              }
            });
          }
        }
      }
    }, (err) => {
      console.error("Error listening to user doc:", err);
    });

    return () => {
      unsubUser();
      if (unsubHospital) unsubHospital();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const currentMenu = hospitalMenuItems.find(item => item.path === location.pathname) || { name: "Hospital Panel" };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:block flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-2xl shadow-md shadow-primary/20">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">Hospital</span>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest block">Portal</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-2 mb-4">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center gap-3">
            {hospitalInfo?.image ? (
              <img src={hospitalInfo.image} alt={hospitalInfo.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                H
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{hospitalInfo?.name || "Hospital Center"}</p>
              <p className="text-xs text-primary font-semibold truncate">{hospitalInfo?.location || "Portal Admin"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {hospitalMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                {item.name}
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Hospital Portal</span>
              <ChevronRight size={16} />
              <span className="text-slate-900 dark:text-white font-bold">{currentMenu.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{hospitalInfo?.name || "Hospital Center"}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{hospitalInfo?.contact || "Contact Portal"}</p>
              </div>
              {hospitalInfo?.image ? (
                <img
                  src={hospitalInfo.image}
                  alt="Hospital"
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border-2 border-primary/20 shadow-sm">
                  H
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
