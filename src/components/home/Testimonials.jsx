import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Quote, Star } from "lucide-react";
import { fadeIn } from "../../animations/variants";

const testimonials = [
  {
    name: "John Doe",
    role: "Patient",
    comment: "MediFind helped me find the best cardiologist in just minutes. The booking process was seamless!",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    name: "Sarah Miller",
    role: "Patient",
    comment: "The interface is so clean and easy to use. I love how I can see all the details of hospitals before visiting.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=22"
  },
  {
    name: "Robert Wilson",
    role: "Patient",
    comment: "Very helpful emergency service. The ambulance arrived quickly and the hospital staff were ready for us.",
    rating: 4,
    image: "https://i.pravatar.cc/150?img=33"
  }
];

export const Testimonials = () => {
  return (
    <section className="section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.div
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            What Our <span className="text-gradient">Patients</span> Say
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Real experiences from people who have used MediFind to access healthcare services.
          </p>
        </motion.div>
      </div>

      <motion.div 
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto"
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          watchSlidesProgress={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
          }}
          className="pb-16"
        >
          {testimonials.map((t, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
                <Quote className="absolute top-8 right-8 text-primary/10" size={80} />
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-lg italic leading-relaxed mb-8">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{t.name}</h4>
                    <p className="text-slate-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};
