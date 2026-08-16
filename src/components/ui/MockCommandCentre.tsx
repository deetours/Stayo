"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, LogIn, Sparkles, IndianRupee, MessageSquare } from "lucide-react";

interface StatProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  delay?: number;
}

const StatCard = ({ label, value, prefix = "", suffix = "", icon: Icon, delay = 0 }: StatProps) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5s
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCurrentValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  const formattedValue = value >= 1000 ? currentValue.toLocaleString('en-IN') : currentValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/60">{label}</span>
        <div className="p-2 bg-background rounded-lg border border-border group-hover:border-accent/50 transition-colors">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-semibold tracking-tight font-mono">
          {prefix}{formattedValue}{suffix}
        </span>
      </div>
    </motion.div>
  );
};

export function MockCommandCentre() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-surface/50 p-2 md:p-4 border border-border shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-foreground/40">Property Live View</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Occupancy" value={72} suffix="%" icon={Users} delay={0.1} />
        </div>
        <StatCard label="Arrivals" value={14} icon={LogIn} delay={0.2} />
        <StatCard label="Rooms Dirty" value={7} icon={Sparkles} delay={0.3} />
        <div className="col-span-2 text-white">
          <StatCard label="Revenue" value={184500} prefix="₹" icon={IndianRupee} delay={0.4} />
        </div>
        <StatCard label="WhatsApp Conv." value={27} icon={MessageSquare} delay={0.5} />
      </div>
    </div>
  );
}
