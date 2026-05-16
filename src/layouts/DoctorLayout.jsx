import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { VideoConsultationRoom } from "../components/consultation/VideoConsultationRoom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Stethoscope,
  ChevronRight,
  Activity,
  MessageSquare
} from "lucide-react";

const doctorMenuItems = [
  { path: "/doctor/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/doctor/appointments", name: "Appointments", icon: CalendarDays },
  { path: "/doctor/messages", name: "Messages", icon: MessageSquare },
  { path: "/doctor/profile", name: "My Profile", icon: UserCheck },
  { path: "/doctor/settings", name: "Settings", icon: SettingsIcon },
];

export const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubDoctor = null;

    const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDoctorInfo(prev => ({ ...prev, ...userData }));

        if (userData.hospitalId && userData.doctorId) {
          if (!unsubDoctor) {
            unsubDoctor = onSnapshot(doc(db, "hospitals", userData.hospitalId, "doctors", userData.doctorId), (docSnap) => {
              if (docSnap.exists()) {
                setDoctorInfo(prev => ({ ...prev, ...docSnap.data() }));
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
      if (unsubDoctor) unsubDoctor();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!doctorInfo?.doctorId) return;

    const q = query(collection(db, "chats"), where("doctorId", "==", doctorInfo.doctorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unread = 0;
      const list = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.unreadDoctor > 0) {
          unread += data.unreadDoctor;
        }
        list.push({ id: docSnap.id, ...data });
      });
      list.sort((a, b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0));
      setUnreadChatsCount(unread);
      setRecentChats(list);
    });

    return () => unsubscribe();
  }, [doctorInfo?.doctorId]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const currentMenu = doctorMenuItems.find(item => item.path === location.pathname) || { name: "Doctor Panel" };

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
              <Stethoscope className="text-white" size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">Doctor</span>
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
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doctorInfo?.name || currentUser?.displayName || "Doctor Portal"}</p>
              <p className="text-xs text-primary font-semibold truncate">{doctorInfo?.category || "Specialist"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {doctorMenuItems.map((item) => (
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
              {item.path === "/doctor/messages" && unreadChatsCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {unreadChatsCount}
                </span>
              )}
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
              <span>Doctor Portal</span>
              <ChevronRight size={16} />
              <span className="text-slate-900 dark:text-white font-bold">{currentMenu.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors cursor-pointer"
              >
                <Bell size={20} />
                {unreadChatsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadChatsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-4 px-2 z-50"
                  >
                    <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Notifications</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                        {unreadChatsCount} unread
                      </span>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto pt-2 space-y-1">
                      {recentChats.filter(c => c.unreadDoctor > 0).length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm font-medium">
                          No new unread messages.
                        </div>
                      ) : (
                        recentChats.filter(c => c.unreadDoctor > 0).map(chat => (
                          <div
                            key={chat.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate("/doctor/messages");
                            }}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                              {chat.patientName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {chat.patientName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {chat.lastMessage}
                              </p>
                            </div>
                            <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{doctorInfo?.name || currentUser?.displayName || "Doctor"}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{doctorInfo?.hospitalName || "Hospital Medical Center"}</p>
              </div>
              <img
                src={doctorInfo?.image || currentUser?.photoURL || "https://ui-avatars.com/api/?name=Doctor&background=random"}
                alt="Doctor"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <VideoConsultationRoom />
    </div>
  );
};
