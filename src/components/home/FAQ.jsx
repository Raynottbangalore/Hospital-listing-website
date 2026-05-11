import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { fadeIn, staggerContainer } from "../../animations/variants";

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "You can book an appointment by selecting a hospital or doctor and clicking the 'Book Appointment' button. Follow the simple steps to choose a date and time."
  },
  {
    question: "Is there any registration fee?",
    answer: "No, registration on MediFind is completely free. You only pay for the consultation at the hospital or clinic."
  },
  {
    question: "Can I cancel my appointment?",
    answer: "Yes, you can cancel your appointment through your dashboard at least 2 hours before the scheduled time."
  },
  {
    question: "Do you provide emergency services?",
    answer: "MediFind lists hospitals that provide 24/7 emergency services. You can find them by looking for the 'Emergency' badge on hospital cards."
  }
];

export const FAQ = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="section-padding bg-slate-50/50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={fadeIn("right", 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="bg-primary/10 p-3 w-fit rounded-2xl mb-6">
            <HelpCircle className="text-primary" size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-lg">
            Have questions about our platform? We've gathered the most common queries to help you get started quickly.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600" 
            alt="Customer Support" 
            className="rounded-3xl shadow-xl hidden lg:block"
          />
        </motion.div>

        <motion.div 
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", 0)}
              className={`rounded-3xl transition-all duration-300 ${active === index ? "bg-white shadow-xl ring-1 ring-primary/10" : "bg-white/50 hover:bg-white/80"}`}
            >
              <button
                onClick={() => setActive(active === index ? -1 : index)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <span className={`text-lg font-bold ${active === index ? "text-primary" : "text-slate-800"}`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-xl transition-colors ${active === index ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                  {active === index ? <Minus size={18} /> : <Plus size={18} />}
                </div>
              </button>
              <AnimatePresence>
                {active === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
