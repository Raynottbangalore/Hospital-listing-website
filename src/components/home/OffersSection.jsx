import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { motion } from "framer-motion";
import { Percent, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const q = query(collection(db, "offers"), where("active", "==", true));
        const snap = await getDocs(q);
        setOffers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Failed to load offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading || offers.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm mb-4"
          >
            <Percent size={16} />
            Exclusive Offers
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-slate-900 mb-4"
          >
            Special Healthcare <span className="text-primary">Discounts</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Take advantage of our limited-time promotions and save on your medical expenses at top-rated hospitals.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/20 transition-all group border border-slate-100"
            >
              <div className="h-48 relative overflow-hidden bg-slate-100">
                {offer.image ? (
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/80 to-secondary flex items-center justify-center p-6 text-center">
                     <h3 className="text-2xl font-black text-white">{offer.discount}</h3>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-primary font-black text-sm shadow-lg flex items-center gap-1">
                  <Percent size={14} />
                  {offer.discount}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{offer.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{offer.description}</p>
                
                <Link 
                  to={offer.hospitalId ? `/hospitals/${offer.hospitalId}` : "/hospitals"}
                  className="inline-flex items-center justify-between w-full px-6 py-3 bg-slate-50 hover:bg-primary hover:text-white rounded-xl font-bold text-slate-700 transition-colors group/btn"
                >
                  {offer.hospitalId ? "View Hospital" : "View All Hospitals"}
                  <ArrowRight size={18} className="text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
