"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  propertyName: z.string().min(2, "Property name is required"),
  propertyType: z.enum(["hotel", "resort", "homestay", "cabin", "hostel", "camp", "group"]),
  rooms: z.string().min(1, "Number of rooms is required"),
  phone: z.string().optional(),
  painPoint: z.string().min(5, "Please tell us about your most manual process"),
});

type FormValues = z.infer<typeof formSchema>;

export function DemoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-demo-modal", handleOpen);
    return () => window.removeEventListener("open-demo-modal", handleOpen);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      reset();
    }, 300); // Reset after animation
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={close}
      />
      
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-hover text-foreground/50 hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Request Received</h2>
            <p className="text-foreground/70 mb-8">
              Thanks for your interest in StayO. Our team will review your details and reach out shortly to schedule your demo.
            </p>
            <button
              onClick={close}
              className="px-6 py-2.5 bg-surface-hover hover:bg-border rounded-full font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-2">See StayO in action</h2>
            <p className="text-foreground/60 text-sm mb-8">
              Tell us a bit about your property, and we'll show you how StayO can run it.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Your Name *</label>
                  <input
                    {...register("name")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
                      errors.name ? "border-red-500/50" : "border-border"
                    )}
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="text-[10px] text-red-400">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Work Email *</label>
                  <input
                    {...register("email")}
                    type="email"
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
                      errors.email ? "border-red-500/50" : "border-border"
                    )}
                    placeholder="jane@property.com"
                  />
                  {errors.email && <p className="text-[10px] text-red-400">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Property Name *</label>
                <input
                  {...register("propertyName")}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
                    errors.propertyName ? "border-red-500/50" : "border-border"
                  )}
                  placeholder="The Grand StayO"
                />
                {errors.propertyName && <p className="text-[10px] text-red-400">{errors.propertyName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Property Type *</label>
                  <select
                    {...register("propertyType")}
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none",
                      errors.propertyType ? "border-red-500/50" : "border-border"
                    )}
                  >
                    <option value="">Select type...</option>
                    <option value="hotel">Boutique Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="homestay">Homestay</option>
                    <option value="cabin">Cabin / Villa</option>
                    <option value="hostel">Hostel</option>
                    <option value="camp">Camp / Glamping</option>
                    <option value="group">Multi-Property Group</option>
                  </select>
                  {errors.propertyType && <p className="text-[10px] text-red-400">{errors.propertyType.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Number of Rooms *</label>
                  <input
                    {...register("rooms")}
                    type="number"
                    min="1"
                    className={cn(
                      "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
                      errors.rooms ? "border-red-500/50" : "border-border"
                    )}
                    placeholder="e.g. 15"
                  />
                  {errors.rooms && <p className="text-[10px] text-red-400">{errors.rooms.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Phone Number <span className="text-foreground/40">(Optional)</span></label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">What's the most manual part of running your property today? *</label>
                <textarea
                  {...register("painPoint")}
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none",
                    errors.painPoint ? "border-red-500/50" : "border-border"
                  )}
                  placeholder="e.g. Updating OTA channels manually, assigning housekeeping tasks via WhatsApp..."
                />
                {errors.painPoint && <p className="text-[10px] text-red-400">{errors.painPoint.message}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-accent hover:brightness-110 text-accent-foreground rounded-full font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    "Request Demo"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
