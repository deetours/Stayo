"use client";

import React from "react";
import { motion } from "framer-motion";

const types = [
  { name: "Boutique Hotels", desc: "Automate room assignments and elevate guest personalization." },
  { name: "Resorts", desc: "Unify activity bookings, dining reservations, and room stays." },
  { name: "Homestays", desc: "Run your property professionally without hiring full-time staff." },
  { name: "Cabins", desc: "Manage remote check-ins and keyless entry workflows seamlessly." },
  { name: "Hostels", desc: "Handle bed-level inventory and high-volume WhatsApp queries." },
  { name: "Multi-Property Groups", desc: "Roll up reporting and cross-sell availability across locations." },
];

export function PropertyTypes() {
  return (
    <section className="w-full bg-surface py-32 px-6 md:px-12 border-t border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Built for every kind of property
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            StayO adapts its workflows to match how you operate, not the other way around.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, i) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-background border border-border"
            >
              <h3 className="text-xl font-semibold mb-2 text-foreground">{type.name}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                {type.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
