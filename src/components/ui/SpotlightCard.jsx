import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const SpotlightCard = ({ children, className, containerClassName }) => {
  const [opacity, setOpacity] = useState(0);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty("--x", `${x}px`);
    containerRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden rounded-[2.5rem] glass group", containerClassName)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(37, 99, 235, 0.1), transparent 40%)`,
        }}
      />
      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};
