"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { setDevSession } from "@/lib/session";
import {
  getVerificationStatus,
  setVerificationStatus,
  getRejectionReason,
  type VerificationStatus,
} from "@/lib/verification";

const STATUS_META: Record<
  VerificationStatus,
  { icon: React.ComponentType<{ className?: string }>; tone: string; title: string }
> = {
  not_started: { icon: Clock, tone: "text-muted-foreground", title: "Not started" },
  under_review: { icon: Clock, tone: "text-accent", title: "Under review" },
  action_required: { icon: AlertTriangle, tone: "text-status-warn", title: "Action required" },
  approved: { icon: CheckCircle2, tone: "text-status-ok", title: "Approved" },
  rejected: { icon: XCircle, tone: "text-status-crit", title: "Not approved" },
};

export default function VerificationStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    const current = getVerificationStatus();
    if (current === "not_started") {
      router.replace("/register");
      return;
    }
    setStatus(current);
  }, [router]);

  if (!status) return null;

  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      <div>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-caption font-semibold uppercase tracking-wider mb-2 ${meta.tone}`}
        >
          <Icon className="w-3.5 h-3.5" /> {meta.title}
        </div>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          Verification {status === "approved" ? "complete" : "in progress"}
        </h2>
      </div>

      {status === "under_review" && (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-heading-sm font-semibold text-foreground">We&apos;re reviewing your details</h4>
            <p className="text-body-sm text-muted-foreground mt-1">
              This usually takes 1–2 business days. We&apos;ll email you as soon as your property is approved.
            </p>
          </div>
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-surface-2 border border-border text-muted-foreground text-body-md font-medium cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {status === "action_required" && (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-status-warn/10 border border-status-warn/30 space-y-1.5">
            <div className="flex items-center gap-2 text-body-md font-semibold text-foreground">
              <AlertTriangle className="w-4 h-4 text-status-warn" />
              <span>One of your documents needs attention</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              We couldn&apos;t confirm a document you submitted. Please upload a clearer copy to continue.
            </p>
          </div>
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Update documents</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {status === "approved" && (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-status-ok/15 border border-status-ok/30 text-status-ok flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-heading-sm font-semibold text-foreground">You&apos;re verified</h4>
            <p className="text-body-sm text-muted-foreground mt-1">
              Let&apos;s get your property set up in StayO.
            </p>
          </div>
          <button
            onClick={() => {
              setDevSession();
              router.push("/onboarding");
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Continue to property setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === "rejected" && (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-status-crit/10 border border-status-crit/30 space-y-1.5">
            <div className="flex items-center gap-2 text-body-md font-semibold text-foreground">
              <XCircle className="w-4 h-4 text-status-crit" />
              <span>We couldn&apos;t verify your property</span>
            </div>
            <p className="text-body-sm text-muted-foreground">{getRejectionReason()}</p>
          </div>
          <a
            href="mailto:support@stayo.app"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-surface-2 border border-border text-foreground text-body-md font-medium hover:bg-border transition-colors cursor-pointer"
          >
            Contact support
          </a>
        </div>
      )}

      {process.env.NODE_ENV !== "production" && (
        <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
          <p className="text-caption uppercase tracking-wider text-muted-foreground font-semibold">
            DEV TOOLS — simulate verification outcome
          </p>
          <div className="flex flex-wrap gap-2">
            {(["under_review", "action_required", "approved", "rejected"] as VerificationStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setVerificationStatus(s, s === "rejected" ? "The address proof you submitted was expired." : undefined);
                  setStatus(s);
                }}
                className="px-2.5 py-1 rounded-sm bg-surface-2 border border-border text-caption text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors cursor-pointer"
              >
                {STATUS_META[s].title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
