/**
 * DEV-ONLY verification/registration state. Backed by localStorage only —
 * there is no backend to submit to, so a real document never leaves the
 * browser and no verification decision is real. `VerificationStatus` is
 * flipped by the DEV-only switcher on `/verification-status`, not by any
 * actual review process.
 */

export type BusinessType = "individual" | "partnership" | "company" | "other";

export type VerificationStatus =
  | "not_started"
  | "under_review"
  | "action_required"
  | "approved"
  | "rejected";

export interface DocumentRequirement {
  id: string;
  label: string;
  helpText: string;
  accept: string;
  maxSizeMB: number;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  individual: "Individual / Sole Proprietor",
  partnership: "Partnership",
  company: "Company",
  other: "Other",
};

// Reasonable, configurable defaults for demonstration only — exact document
// requirements vary by region and should be confirmed with legal/compliance
// before this becomes a real verification gate.
export const REQUIRED_DOCUMENTS: Record<BusinessType, DocumentRequirement[]> = {
  individual: [
    {
      id: "gov-id",
      label: "Government-issued ID",
      helpText: "Passport, driver's license, or national ID card.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "address-proof",
      label: "Proof of address",
      helpText: "A recent utility bill or bank statement.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
  ],
  partnership: [
    {
      id: "gov-id",
      label: "Government-issued ID (signing partner)",
      helpText: "Passport, driver's license, or national ID card.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "partnership-deed",
      label: "Partnership deed or agreement",
      helpText: "Document establishing the partnership.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "tax-id",
      label: "Business tax ID",
      helpText: "GSTIN, EIN, or your local equivalent.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
  ],
  company: [
    {
      id: "incorporation",
      label: "Certificate of incorporation",
      helpText: "Issued by your local company registrar.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "tax-id",
      label: "Business tax ID",
      helpText: "GSTIN, EIN, or your local equivalent.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "signatory-id",
      label: "Government-issued ID (authorized signatory)",
      helpText: "Passport, driver's license, or national ID card.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
  ],
  other: [
    {
      id: "gov-id",
      label: "Government-issued ID",
      helpText: "Passport, driver's license, or national ID card.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
    {
      id: "business-proof",
      label: "Proof of business operation",
      helpText: "Any document showing the property is actively operating.",
      accept: "image/*,.pdf",
      maxSizeMB: 8,
    },
  ],
};

export interface RegistrationDraft {
  step: number;
  account: {
    name: string;
    email: string;
    phone: string;
  };
  business: {
    name: string;
    type: BusinessType;
    location: string;
    taxId: string;
  };
  property: {
    name: string;
    type: string;
    rooms: string;
  };
  uploadedDocumentIds: string[];
}

export const EMPTY_DRAFT: RegistrationDraft = {
  step: 1,
  account: { name: "", email: "", phone: "" },
  business: { name: "", type: "individual", location: "", taxId: "" },
  property: { name: "", type: "", rooms: "" },
  uploadedDocumentIds: [],
};

const DRAFT_KEY = "stayo_dev_registration_draft";
const STATUS_KEY = "stayo_dev_verification_status";
const REJECTION_REASON_KEY = "stayo_dev_rejection_reason";

export function saveDraft(draft: RegistrationDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): RegistrationDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function getVerificationStatus(): VerificationStatus {
  if (typeof window === "undefined") return "not_started";
  return (window.localStorage.getItem(STATUS_KEY) as VerificationStatus | null) ?? "not_started";
}

export function setVerificationStatus(status: VerificationStatus, rejectionReason?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATUS_KEY, status);
  if (status === "rejected" && rejectionReason) {
    window.localStorage.setItem(REJECTION_REASON_KEY, rejectionReason);
  }
}

export function getRejectionReason(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(REJECTION_REASON_KEY) ??
    "We couldn't verify one of your submitted documents."
  );
}
