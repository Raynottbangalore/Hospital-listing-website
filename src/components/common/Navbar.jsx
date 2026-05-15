import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, HeartPulse, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hospitals", path: "/hospitals" },
    { name: "Doctors", path: "/doctors" },
    ...(currentUser ? [{ name: "My Bookings", path: "/dashboard" }] : []),
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-12 lg:px-24 py-4",
        scrolled ? "glass py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <HeartPulse className="text-white" size={24} />
          </div>
          <span className={cn(
            "text-2xl font-bold transition-colors duration-300",
            scrolled ? "text-slate-900" : "text-slate-900" // Always slate for now, can be white on hero
          )}>
            Medi<span className="text-primary">Find</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "font-medium transition-all duration-300 hover:text-primary relative group",
                location.pathname === link.path ? "text-primary" : "text-slate-600"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                location.pathname === link.path ? "w-full" : ""
              )} />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <>
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200">
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User size={18} /> Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-2xl border border-slate-100 mt-4 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium p-2 rounded-xl",
                    location.pathname === link.path ? "bg-primary/10 text-primary" : "text-slate-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-slate-200" />
              <div className="flex flex-col gap-3">
                {currentUser ? (
                  <>
                    <Button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white">
                      <LogOut size={18} /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
