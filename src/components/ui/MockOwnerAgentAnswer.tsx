"use client";

import React, { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function MockOwnerAgentAnswer() {
  const [typing, setTyping] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // In a real implementation this would be triggered by GSAP scroll position
  // For the mock, we'll just run it on mount
  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 500);
    const t2 = setTimeout(() => {
      setTyping(false);
      setShowAnswer(true);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-surface/80 border border-border shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border bg-background/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shrink-0">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div className="text-sm font-medium text-foreground/80 flex-1">
          <span className="text-foreground/50">Owner Agent</span>
        </div>
      </div>

      <div className="p-5 flex-1 bg-surface/30">
        <div className="mb-6 font-medium text-lg text-foreground">
          "How did we perform this month?"
        </div>

        <div className="relative min-h-[160px]">
          {typing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-accent text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Analyzing property performance...
            </motion.div>
          )}

          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-sm text-foreground/90 leading-relaxed">
                August was a strong month. You achieved <strong className="text-accent">78% occupancy</strong>, which is up 12% from last month. 
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background border border-border rounded-lg">
                  <div className="text-[10px] uppercase tracking-wider text-foreground/50 mb-1">Total Revenue</div>
                  <div className="font-mono font-semibold">₹14.2L <span className="text-green-500 text-xs font-sans ml-1">↑ 8%</span></div>
                </div>
                <div className="p-3 bg-background border border-border rounded-lg">
                  <div className="text-[10px] uppercase tracking-wider text-foreground/50 mb-1">Direct Bookings</div>
                  <div className="font-mono font-semibold">42% <span className="text-green-500 text-xs font-sans ml-1">↑ 15%</span></div>
                </div>
              </div>

              <p className="text-xs text-foreground/60 italic border-l-2 border-accent/50 pl-3">
                Recommendation: With high weekend demand, I suggest raising weekend ADR by ₹500 for September to maximize yield.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
