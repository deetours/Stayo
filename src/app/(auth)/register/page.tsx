"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { durations, eases } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DocumentUploadField } from "@/components/patterns/DocumentUploadField";
import { setDevSession } from "@/lib/session";
import {
  REQUIRED_DOCUMENTS,
  BUSINESS_TYPE_LABELS,
  saveDraft,
  loadDraft,
  setVerificationStatus,
  type BusinessType,
  type RegistrationDraft,
} from "@/lib/verification";

const registerSchema = z.object({
  accountName: z.string().min(2, "Name is required"),
  accountEmail: z.string().email("Enter a valid email address"),
  accountPhone: z.string().optional(),
  accountPassword: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["individual", "partnership", "company", "other"]),
  businessLocation: z.string().min(2, "Location is required"),
  businessTaxId: z.string().optional(),
  propertyName: z.string().min(2, "Property name is required"),
  propertyType: z.string().min(1, "Select a property type"),
  propertyRooms: z.string().min(1, "Number of rooms is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const STEP_FIELDS: Record<number, (keyof RegisterFormValues)[]> = {
  1: ["accountName", "accountEmail", "accountPhone", "accountPassword"],
  2: ["businessName", "businessType", "businessLocation", "businessTaxId"],
  3: ["propertyName", "propertyType", "propertyRooms"],
  4: [],
  5: [],
};

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Business" },
  { id: 3, label: "Property" },
  { id: 4, label: "Documents" },
  { id: 5, label: "Review" },
];

const propertyTypes = [
  { value: "hotel", label: "Boutique Hotel" },
  { value: "resort", label: "Resort" },
  { value: "homestay", label: "Homestay" },
  { value: "cabin", label: "Cabin / Villa" },
  { value: "hostel", label: "Hostel" },
  { value: "camp", label: "Camp / Glamping" },
  { value: "group", label: "Multi-Property Group" },
];

function fieldClasses(hasError: boolean) {
  return cn(
    "w-full bg-surface-2 border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent",
    hasError ? "border-status-crit focus:ring-status-crit" : "border-border"
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [resumed, setResumed] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountName: "",
      accountEmail: "",
      accountPhone: "",
      accountPassword: "",
      businessName: "",
      businessType: "individual",
      businessLocation: "",
      businessTaxId: "",
      propertyName: "",
      propertyType: "",
      propertyRooms: "",
    },
  });

  const businessType = watch("businessType") as BusinessType;
  const requiredDocs = REQUIRED_DOCUMENTS[businessType] ?? REQUIRED_DOCUMENTS.individual;
  const allDocumentsUploaded = requiredDocs.every((doc) => uploadedDocs[doc.id]);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      reset({
        accountName: draft.account.name,
        accountEmail: draft.account.email,
        accountPhone: draft.account.phone,
        accountPassword: "",
        businessName: draft.business.name,
        businessType: draft.business.type,
        businessLocation: draft.business.location,
        businessTaxId: draft.business.taxId,
        propertyName: draft.property.name,
        propertyType: draft.property.type,
        propertyRooms: draft.property.rooms,
      });
      const restoredUploads: Record<string, boolean> = {};
      draft.uploadedDocumentIds.forEach((id) => (restoredUploads[id] = true));
      setUploadedDocs(restoredUploads);
      setCurrentStep(Math.min(draft.step, 3)); // documents can't be restored (files aren't persisted)
      setResumed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = (step: number) => {
    const values = getValues();
    const draft: RegistrationDraft = {
      step,
      account: { name: values.accountName, email: values.accountEmail, phone: values.accountPhone ?? "" },
      business: {
        name: values.businessName,
        type: values.businessType,
        location: values.businessLocation,
        taxId: values.businessTaxId ?? "",
      },
      property: { name: values.propertyName, type: values.propertyType, rooms: values.propertyRooms },
      uploadedDocumentIds: Object.keys(uploadedDocs).filter((id) => uploadedDocs[id]),
    };
    saveDraft(draft);
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (currentStep === 4 && !allDocumentsUploaded) return;

    persistDraft(currentStep + 1);
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const onSubmit = () => {
    setIsSubmitting(true);
    persistDraft(5);
    setTimeout(() => {
      setVerificationStatus("under_review");
      setDevSession();
      router.push("/verification-status");
    }, 800);
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: durations.standard, ease: eases.standard };

  const values = getValues();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          {STEPS[currentStep - 1].label === "Account" && "Create your account"}
          {STEPS[currentStep - 1].label === "Business" && "Tell us about your business"}
          {STEPS[currentStep - 1].label === "Property" && "Tell us about your property"}
          {STEPS[currentStep - 1].label === "Documents" && "Verify your business"}
          {STEPS[currentStep - 1].label === "Review" && "Review & submit"}
        </h2>
        <p className="text-body-sm text-muted-foreground mt-1">
          {STEPS[currentStep - 1].label === "Account" && "Start with the basics — you can change these later."}
          {STEPS[currentStep - 1].label === "Business" && "This helps us tailor verification to how you operate."}
          {STEPS[currentStep - 1].label === "Property" && "A rough estimate is fine — you'll refine this during setup."}
          {STEPS[currentStep - 1].label === "Documents" &&
            "Required documents vary by business type. This keeps StayO trustworthy for guests and staff."}
          {STEPS[currentStep - 1].label === "Review" && "Make sure everything looks right before we submit it for review."}
        </p>
      </div>

      {resumed && currentStep < 5 && (
        <div className="text-caption text-accent bg-accent/10 border border-accent/20 rounded-sm px-3 py-2">
          Resumed from where you left off.
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1" aria-label="Registration progress">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div
              aria-current={currentStep === step.id ? "step" : undefined}
              title={step.label}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border transition-colors",
                step.id < currentStep && "bg-accent border-accent text-accent-foreground",
                step.id === currentStep && "border-accent text-accent",
                step.id > currentStep && "border-border text-muted-foreground"
              )}
            >
              {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px transition-colors",
                  step.id < currentStep ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -direction * 16 }}
            transition={transition}
            className="space-y-4"
          >
            {currentStep === 1 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Full Name
                  </label>
                  <input {...register("accountName")} placeholder="Jane Doe" className={fieldClasses(!!errors.accountName)} />
                  {errors.accountName && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.accountName.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Email Address
                  </label>
                  <input
                    {...register("accountEmail")}
                    type="email"
                    placeholder="jane@property.com"
                    className={fieldClasses(!!errors.accountEmail)}
                  />
                  {errors.accountEmail && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.accountEmail.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Phone Number <span className="normal-case text-muted-foreground/70">(Optional)</span>
                  </label>
                  <input
                    {...register("accountPhone")}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className={fieldClasses(false)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Password
                  </label>
                  <input
                    {...register("accountPassword")}
                    type="password"
                    placeholder="••••••••"
                    className={fieldClasses(!!errors.accountPassword)}
                  />
                  {errors.accountPassword && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.accountPassword.message}
                    </span>
                  )}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Business Name
                  </label>
                  <input
                    {...register("businessName")}
                    placeholder="Off The Trail Hospitality"
                    className={fieldClasses(!!errors.businessName)}
                  />
                  {errors.businessName && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.businessName.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Business Type
                  </label>
                  <select {...register("businessType")} className={cn(fieldClasses(false), "appearance-none")}>
                    {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Business Location
                  </label>
                  <input
                    {...register("businessLocation")}
                    placeholder="Dalhousie, Himachal Pradesh"
                    className={fieldClasses(!!errors.businessLocation)}
                  />
                  {errors.businessLocation && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.businessLocation.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Tax / GSTIN <span className="normal-case text-muted-foreground/70">(Optional)</span>
                  </label>
                  <input {...register("businessTaxId")} placeholder="22AAAAA0000A1Z5" className={fieldClasses(false)} />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Property Name
                  </label>
                  <input
                    {...register("propertyName")}
                    placeholder="The Grand StayO"
                    className={fieldClasses(!!errors.propertyName)}
                  />
                  {errors.propertyName && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.propertyName.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Property Type
                  </label>
                  <select {...register("propertyType")} className={cn(fieldClasses(!!errors.propertyType), "appearance-none")}>
                    <option value="">Select type...</option>
                    {propertyTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.propertyType.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Approximate Number of Rooms
                  </label>
                  <input
                    {...register("propertyRooms")}
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    className={fieldClasses(!!errors.propertyRooms)}
                  />
                  {errors.propertyRooms && (
                    <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.propertyRooms.message}
                    </span>
                  )}
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                {requiredDocs.map((doc) => (
                  <DocumentUploadField
                    key={doc.id}
                    requirement={doc}
                    onStatusChange={(id, uploaded) =>
                      setUploadedDocs((prev) => ({ ...prev, [id]: uploaded }))
                    }
                  />
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface-2 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-body-md font-semibold text-foreground">
                    <Building2 className="w-4 h-4 text-accent" />
                    <span>Summary</span>
                  </div>
                  <dl className="text-body-sm space-y-1.5">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Owner</dt>
                      <dd className="text-foreground text-right">{values.accountName || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="text-foreground text-right">{values.accountEmail || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Business</dt>
                      <dd className="text-foreground text-right">{values.businessName || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Business type</dt>
                      <dd className="text-foreground text-right">{BUSINESS_TYPE_LABELS[businessType]}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Property</dt>
                      <dd className="text-foreground text-right">{values.propertyName || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Documents</dt>
                      <dd className="text-foreground text-right">
                        {requiredDocs.filter((d) => uploadedDocs[d.id]).length} / {requiredDocs.length} uploaded
                      </dd>
                    </div>
                  </dl>
                </div>
                <p className="text-caption text-muted-foreground">
                  Submitting sends your details for verification. In this preview environment, verification is
                  simulated — no documents leave your browser.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pt-6 flex items-center gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-sm bg-surface-2 border border-border text-foreground text-body-md font-medium hover:bg-border transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={goNext}
              disabled={currentStep === 4 && !allDocumentsUploaded}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-accent-foreground border-t-transparent animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span>Submit for Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <div className="text-center pt-2 text-body-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
