'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Lock, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  // Requirements
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

  const strengthScore = [hasLength, hasNumber, hasSymbol, hasUpperLower].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 3 || password !== confirmPassword) return;
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          Create new password
        </h2>
        <p className="text-body-sm text-muted-foreground mt-1">
          Please choose a strong password for your StayO account.
        </p>
      </div>

      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-heading-sm font-semibold text-foreground">Password updated</h4>
            <p className="text-body-sm text-muted-foreground mt-1">
              Your password has been successfully reset.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 transition-all inline-block"
            >
              Sign in with new password
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex gap-1 h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-fast ${
                  strengthScore >= 1
                    ? strengthScore >= 3
                      ? 'bg-status-ok'
                      : 'bg-status-warn'
                    : 'bg-transparent'
                }`}
                style={{ width: `${(strengthScore / 4) * 100}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1.5 text-[12px] text-muted-foreground pt-1">
              <div className={`flex items-center gap-1.5 ${hasLength ? 'text-status-ok' : ''}`}>
                {hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-muted-foreground/50" />}
                8+ characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-status-ok' : ''}`}>
                {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-muted-foreground/50" />}
                Number included
              </div>
              <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-status-ok' : ''}`}>
                {hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-muted-foreground/50" />}
                Special symbol
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpperLower ? 'text-status-ok' : ''}`}>
                {hasUpperLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-muted-foreground/50" />}
                Upper & lower case
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={strengthScore < 3 || password !== confirmPassword}
            className="w-full mt-2 inline-flex items-center justify-center py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40"
          >
            Update password
          </button>
        </form>
      )}
    </div>
  );
}



