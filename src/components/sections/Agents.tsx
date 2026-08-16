"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, ConciergeBell, Sparkles, TrendingUp, Bot, Megaphone } from "lucide-react";

const agents = [
  {
    title: "Reservation Agent",
    icon: CalendarCheck,
    desc: "Handles enquiries, availability, and confirmations 24/7.",
    example: '"Can I book a suite for next weekend?" → Auto-booked & confirmed.',
  },
  {
    title: "Guest Concierge",
    icon: ConciergeBell,
    desc: "Responds to guest requests via WhatsApp instantly.",
    example: '"We need extra towels." → Task auto-assigned to housekeeping.',
  },
  {
    title: "Housekeeping Agent",
    icon: Sparkles,
    desc: "Coordinates room status and cleaning workflows.",
    example: '"Room 204 checked out early." → Priority cleaning assigned.',
  },
  {
    title: "Revenue Agent",
    icon: TrendingUp,
    desc: "Adjusts pricing dynamically based on demand and comps.",
    example: '"High search volume for NYE." → Weekend ADR increased by 15%.',
  },
  {
    title: "Owner Agent",
    icon: Bot,
    desc: "Answers plain-language business performance queries.",
    example: '"How was ADR last week?" → "₹4,200, up 8% from last month."',
  },
  {
    title: "Marketing Agent",
    icon: Megaphone,
    desc: "Flags low-occupancy windows and recommends packages.",
    example: '"Only 30% occupancy next week." → Custom email campaign drafted.',
  },
];

export function Agents() {
  return (
    <section id="agents" className="w-full bg-background py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-foreground"
          >
            A chatbot answers questions. <br />
            <span className="text-accent">An agent takes action.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 md:p-8 rounded-2xl bg-surface border border-border flex flex-col group hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <agent.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{agent.title}</h3>
              <p className="text-foreground/70 mb-6 flex-1">
                {agent.desc}
              </p>
              
              <div className="p-4 rounded-xl bg-background border border-border text-sm">
                <span className="text-foreground/50 text-xs uppercase tracking-wider block mb-2 font-semibold">Example</span>
                <span className="text-foreground/90 italic">
                  {agent.example}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
