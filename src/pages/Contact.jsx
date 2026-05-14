import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../components/common/Button";
import { fadeIn } from "../animations/variants";

export const Contact = () => {
  const [settings, setSettings] = useState({
    contactEmail: "support@medifind.com",
    contactPhone: "+1 (800) 123-4567",
    address: "123 Medical Plaza, New York, NY",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="section-padding min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            animate="show"
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help you 24/7.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          {/* Contact Cards */}
          <div className="space-y-6">
            {[
              { title: "Email Us", info: settings.contactEmail, icon: Mail, color: "bg-blue-500" },
              { title: "Call Us", info: settings.contactPhone, icon: Phone, color: "bg-teal-500" },
              { title: "Visit Us", info: settings.address, icon: MapPin, color: "bg-indigo-500" },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={fadeIn("right", i * 0.1)}
                initial="hidden"
                animate="show"
                className="glass p-8 rounded-[2.5rem] flex items-center gap-6 group hover:translate-x-2 transition-all duration-300"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", card.color)}>
                  <card.icon size={28} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</h4>
                  <p className="text-lg font-bold text-slate-900">{card.info}</p>
                </div>
              </motion.div>
            ))}

            {/* Support Box */}
            <div className="glass p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">24/7 Live Support</span>
              </div>
              <h3 className="text-2xl font-bold">Ready to help you anytime!</h3>
              <p className="text-slate-400 text-sm">Our support team is always available for emergency queries and platform assistance.</p>
              <Button className="w-full" variant="secondary">Start Live Chat</Button>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            variants={fadeIn("left", 0.2)}
            initial="hidden"
            animate="show"
            className="glass p-10 md:p-16 rounded-[4rem] shadow-2xl bg-white"
          >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border-none rounded-[1.5rem] px-8 py-5 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-slate-50 border-none rounded-[1.5rem] px-8 py-5 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Subject</label>
                <select className="w-full bg-slate-50 border-none rounded-[1.5rem] px-8 py-5 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none">
                  <option>General Inquiry</option>
                  <option>Appointment Issue</option>
                  <option>Hospital Partnership</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Your Message</label>
                <textarea rows="5" placeholder="How can we help you?" className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"></textarea>
              </div>

              <Button className="w-full py-6 text-xl rounded-[2rem] gap-3" size="lg">
                Send Message <ArrowRight size={24} />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Map Section Mockup */}
        <div className="mt-20 h-[400px] rounded-[4rem] overflow-hidden glass border-8 border-white shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700">
          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Map Placeholder" />
          <div className="absolute inset-0 bg-primary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white animate-bounce shadow-[0_0_30px_rgba(37,99,235,0.8)]">
                <MapPin size={24} />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 glass px-4 py-2 rounded-xl whitespace-nowrap font-bold text-slate-900 shadow-xl">
                MediFind HQ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
