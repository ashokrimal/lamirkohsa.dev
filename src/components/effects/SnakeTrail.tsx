'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TrailDot = ({ mouseX, mouseY, index, total }: { 
  mouseX: any; 
  mouseY: any; 
  index: number; 
  total: number 
}) => {
  const x = useSpring(0, { stiffness: 100 + (index * 5), damping: 20 + (index * 2) });
  const y = useSpring(0, { stiffness: 100 + (index * 5), damping: 20 + (index * 2) });
  
  useEffect(() => {
    x.set(mouseX.get());
    y.set(mouseY.get());
  }, [mouseX, mouseY, x, y]);

  const scale = useTransform(
    mouseX,
    [0, window.innerWidth],
    [1 - (index / total) * 0.8, 1 - (index / total) * 0.7]
  );

  const opacity = useTransform(
    mouseY,
    [0, window.innerHeight],
    [1 - (index / total) * 0.9, 1 - (index / total) * 0.7]
  );

  return (
    <motion.div
      className="absolute w-4 h-4 rounded-full bg-blue-400"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex: -1,
      }}
    />
  );
};

export default function SnakeTrail() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const trailRef = useRef<HTMLDivElement>(null);
  const trailLength = 10;

  const trailDots = useMemo(() => {
    return Array.from({ length: trailLength }).map((_, i) => (
      <TrailDot 
        key={i} 
        mouseX={mouseX} 
        mouseY={mouseY} 
        index={i} 
        total={trailLength} 
      />
    ));
  }, [mouseX, mouseY, trailLength]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX - 8); // Center the dot
      mouseY.set(e.clientY - 8); // Center the dot
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" ref={trailRef}>
      {trailDots}
    </div>
  );
}