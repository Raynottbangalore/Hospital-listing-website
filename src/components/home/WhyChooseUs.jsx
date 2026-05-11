import { motion } from "framer-motion";
import { ShieldCheck, Zap, Heart, Globe, Award, Sparkles } from "lucide-react";
import { fadeIn, staggerContainer } from "../../animations/variants";

const features = [
  {
    title: "Instant Access",
    desc: "Book your appointment in less than 60 seconds with our streamlined AI booking system.",
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    title: "Global Standards",
    desc: "We only partner with hospitals that meet international safety and hygiene standards.",
    icon: Globe,
    color: "bg-blue-500",
  },
  {
    title: "Expert Vetting",
    desc: "Every doctor on our platform is manually verified for credentials and experience.",
    icon: ShieldCheck,
    color: "bg-green-500",
  },
  {
    title: "Patient First",
    desc: "Our 24/7 support team is always ready to assist you with your healthcare journey.",
    icon: Heart,
    color: "bg-red-500",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-slate-900 text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          variants={fadeIn("right", 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="text-primary" size={16} />
            <span className="text-sm font-black uppercase tracking-widest text-primary">Why MediFind</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-7xl font-black leading-[1.1] md:leading-tight">
            The Future of <br className="hidden xs:block" />
            <span className="text-primary">Medical Access.</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-xl leading-relaxed font-medium">
            We are more than just a directory. We are a comprehensive healthcare ecosystem designed to make high-quality medical care accessible to everyone, everywhere.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-3xl font-black">99.9%</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uptime Reliability</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-3xl font-black">24/7</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Support</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.2, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn("up", i * 0.1)}
              className="glass-dark p-8 rounded-[2.5rem] space-y-6 hover:bg-white/5 transition-colors group cursor-default will-change-transform"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform`}>
                <feature.icon size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
