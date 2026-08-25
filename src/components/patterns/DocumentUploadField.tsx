"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { DocumentRequirement } from "@/lib/verification";

type UploadState = "empty" | "uploading" | "uploaded" | "error";

interface DocumentUploadFieldProps {
  requirement: DocumentRequirement;
  onStatusChange?: (id: string, uploaded: boolean) => void;
}

/**
 * DEV-ONLY document upload UX. Files are held only in this component's
 * local state (never sent anywhere) and "upload progress" is a simulated
 * timeout, matching the fake-latency convention already used by the login
 * form. Wiring this to real storage is a backend requirement out of scope
 * here.
 */
export function DocumentUploadField({ requirement, onStatusChange }: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    onStatusChange?.(requirement.id, state === "uploaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const acceptedTypes = requirement.accept.split(",").map((t) => t.trim());

  const validate = (candidate: File): string | null => {
    const sizeMB = candidate.size / (1024 * 1024);
    if (sizeMB > requirement.maxSizeMB) {
      return `File is ${sizeMB.toFixed(1)}MB — must be under ${requirement.maxSizeMB}MB.`;
    }
    const matchesType = acceptedTypes.some((accepted) => {
      if (accepted.startsWith(".")) return candidate.name.toLowerCase().endsWith(accepted);
      if (accepted.endsWith("/*")) return candidate.type.startsWith(accepted.replace("/*", "/"));
      return candidate.type === accepted;
    });
    if (!matchesType) {
      return `Unsupported file type. Accepted: ${requirement.accept.replace(/,/g, ", ")}`;
    }
    return null;
  };

  const handleFile = useCallback(
    (candidate: File) => {
      const validationError = validate(candidate);
      if (validationError) {
        setError(validationError);
        setState("error");
        return;
      }

      setError(null);
      setFile(candidate);
      if (candidate.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(candidate));
      } else {
        setPreviewUrl(null);
      }

      setState("uploading");
      setTimeout(() => {
        setState("uploaded");
      }, 700);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requirement]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setState("empty");
  };

  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.22 };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
          {requirement.label}
        </label>
      </div>
      <p className="text-caption text-muted-foreground">{requirement.helpText}</p>

      <input
        ref={inputRef}
        type="file"
        accept={requirement.accept}
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        aria-label={requirement.label}
      />

      <AnimatePresence mode="wait">
        {state === "empty" || state === "error" ? (
          <motion.div
            key="dropzone"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center cursor-pointer transition-colors",
              isDragOver ? "border-accent bg-accent/5" : "border-border bg-surface-2 hover:border-muted-foreground/40",
              state === "error" && "border-status-crit/50"
            )}
          >
            <UploadCloud className="w-5 h-5 text-muted-foreground" />
            <span className="text-body-sm text-foreground font-medium">
              Drop a file or click to browse
            </span>
            <span className="text-caption text-muted-foreground">
              {requirement.accept.replace(/,/g, ", ")} · up to {requirement.maxSizeMB}MB
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="w-9 h-9 rounded-sm object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-sm bg-surface flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-body-sm text-foreground font-medium truncate">{file?.name}</div>
              <div className="text-caption text-muted-foreground">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
              </div>
            </div>
            {state === "uploading" ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-status-ok shrink-0" />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer shrink-0"
              aria-label={`Remove ${requirement.label}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </div>
  );
}
