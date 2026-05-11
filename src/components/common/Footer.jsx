import { Link } from "react-router-dom";
import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { Button } from "./Button";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <HeartPulse className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold">
              Medi<span className="text-primary">Find</span>
            </span>
          </Link>
          <p className="text-slate-400 leading-relaxed">
            Revolutionizing healthcare access with technology. Find the best hospitals and doctors in your city with just a few clicks.
          </p>
          <div className="flex items-center gap-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors duration-300"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4">
            {["Home", "Hospitals", "Doctors", "About Us", "Contact"].map((item) => (
              <li key={item}>
                <Link to={`/${item.toLowerCase().replace(" ", "-")}`} className="text-slate-400 hover:text-primary transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">Services</h4>
          <ul className="space-y-4">
            {["Emergency Care", "Consultation", "Diagnostics", "Pharmacy", "Telehealth"].map((item) => (
              <li key={item}>
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">Newsletter</h4>
          <p className="text-slate-400 mb-6">Subscribe to get the latest health updates and news.</p>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <Button className="w-full">Subscribe</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
        <p>© 2024 MediFind. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};
