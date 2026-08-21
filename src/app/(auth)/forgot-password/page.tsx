'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          Reset password
        </h2>
        <p className="text-body-sm text-muted-foreground mt-1">
          Enter your email address and we will send you a recovery link.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-heading-sm font-semibold text-foreground">Link dispatched</h4>
            <p className="text-body-sm text-muted-foreground mt-1">
              If an account exists for <span className="font-mono text-foreground">{email}</span>, you will receive password reset instructions.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 transition-all inline-block"
            >
              Return to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@hotel.com"
              className={`w-full bg-surface-2 border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                error ? 'border-status-crit focus:ring-status-crit' : 'border-border'
              }`}
            />
            {error && (
              <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Send recovery link
          </button>
        </form>
      )}
    </div>
  );
}
