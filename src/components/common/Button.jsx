import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Button = ({ 
  children, 
  variant = "primary", 
  className, 
  size = "md",
  ...props 
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-primary/20",
    secondary: "bg-secondary text-white hover:opacity-90 shadow-secondary/20",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-primary hover:bg-primary/10",
    glass: "glass bg-white/20 text-white hover:bg-white/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-semibold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
