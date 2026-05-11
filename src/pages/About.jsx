import { motion } from "framer-motion";
import { ShieldCheck, Heart, Users, Target, Rocket, Award } from "lucide-react";
import { fadeIn } from "../animations/variants";

export const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <motion.div
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <span className="text-primary font-black uppercase tracking-[0.3em] mb-6 block">Our Mission</span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Redefining the <span className="text-gradient">Future</span> of Healthcare.
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed mb-10">
              We believe that quality healthcare should be accessible to everyone. Our platform bridges the gap between patients and the best medical professionals through cutting-edge technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 px-6">
          {[
            { label: "Patients Served", value: "1M+" },
            { label: "Verified Doctors", value: "5000+" },
            { label: "Partner Hospitals", value: "1200+" },
            { label: "Countries", value: "15+" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeIn("up", i * 0.1)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
              <h3 className="text-4xl font-black text-slate-900 mb-2">{stat.value}</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={fadeIn("right", 0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[4rem] shadow-2xl" 
              alt="Medical Team" 
            />
          </motion.div>
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Our Core Values</h2>
              <p className="text-slate-600 text-lg">We are guided by principles that put patients first and ensure excellence in everything we do.</p>
            </div>

            <div className="grid gap-8">
              {[
                { title: "Transparency", desc: "Open communication and honest pricing for all medical services.", icon: ShieldCheck },
                { title: "Excellence", desc: "Partnering with only top-rated hospitals and specialist doctors.", icon: Award },
                { title: "Innovation", desc: "Using AI and modern tech to streamline the healthcare journey.", icon: Rocket },
              ].map((value, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <value.icon size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h4>
                    <p className="text-slate-500">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding bg-slate-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Our Journey</h2>
          <p className="text-slate-500">How we grew from a small startup to a leading healthcare platform.</p>
        </div>

        <div className="max-w-4xl mx-auto relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-1 before:bg-primary/10 before:-translate-x-1/2 hidden md:block">
          {[
            { year: "2020", title: "The Beginning", desc: "MediFind was founded with a vision to simplify healthcare access." },
            { year: "2021", title: "Expansion", desc: "We partnered with our first 100 hospitals and 500 doctors." },
            { year: "2022", title: "New Features", desc: "Launched online video consultations and AI health assistant." },
            { year: "2023", title: "Going Global", desc: "Expanded our services to 5 new countries across Asia and Europe." },
          ].map((item, i) => (
            <motion.div 
              key={i}
              variants={fadeIn(i % 2 === 0 ? "right" : "left", 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className={cn(
                "relative w-1/2 mb-16",
                i % 2 === 0 ? "pr-20 text-right ml-0" : "pl-20 text-left ml-auto"
              )}
            >
              <div className={cn(
                "absolute top-0 w-10 h-10 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-xl z-10",
                i % 2 === 0 ? "-right-5" : "-left-5"
              )}>
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-primary font-black text-xl mb-2 block">{item.year}</span>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h4>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
