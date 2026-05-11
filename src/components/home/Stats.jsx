import { motion } from "framer-motion";
import { Users, Hospital, Stethoscope, Award } from "lucide-react";
import { fadeIn } from "../../animations/variants";

export const Stats = () => {
  const stats = [
    { label: "Happy Patients", value: "50k+", icon: Users, color: "bg-blue-500" },
    { label: "Expert Doctors", value: "800+", icon: Stethoscope, color: "bg-teal-500" },
    { label: "Hospitals", value: "120+", icon: Hospital, color: "bg-indigo-500" },
    { label: "Awards Won", value: "25+", icon: Award, color: "bg-amber-500" },
  ];

  return (
    <section className="section-padding bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeIn("up", index * 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl glass transition-all duration-300 hover:translate-y-[-5px]"
          >
            <div className={`p-3 md:p-4 rounded-2xl ${stat.color} text-white mb-4 shadow-lg`}>
              <stat.icon size={24} className="md:size-7" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 md:mb-2">{stat.value}</h3>
            <p className="text-xs md:text-base text-slate-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
