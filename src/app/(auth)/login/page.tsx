'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (magicSent && cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [magicSent, cooldown]);

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
    return undefined;
  };

  const handleBlurEmail = () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = authMode === 'password' && !password ? 'Password is required' : undefined;

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    setTimeout(() => {
      setIsSubmitting(false);
      if (authMode === 'magic') {
        setMagicSent(true);
        setCooldown(60);
      } else {
        // Redirect to main command centre
        router.push('/app/dashboard');
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-body-sm text-muted-foreground mt-1">
          Sign in to access your property dashboard and operations.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-surface-2 rounded-md border border-border">
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setMagicSent(false);
          }}
          className={`py-1.5 text-body-sm font-medium rounded-sm transition-all cursor-pointer ${
            authMode === 'password'
              ? 'bg-surface text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('magic')}
          className={`py-1.5 text-body-sm font-medium rounded-sm transition-all cursor-pointer ${
            authMode === 'magic'
              ? 'bg-surface text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Magic Link
        </button>
      </div>

      {magicSent ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-heading-sm font-semibold text-foreground">Check your inbox</h4>
            <p className="text-body-sm text-muted-foreground mt-1">
              We sent a login link to <span className="text-foreground font-mono font-medium">{email}</span>.
            </p>
          </div>

          <div className="pt-2">
            {cooldown > 0 ? (
              <p className="text-caption text-muted-foreground font-mono">
                Resend available in {cooldown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setCooldown(60)}
                className="text-body-sm text-accent hover:underline font-medium cursor-pointer"
              >
                Resend magic link
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlurEmail}
                placeholder="name@property.com"
                className={`w-full bg-surface-2 border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                  errors.email ? 'border-status-crit focus:ring-status-crit' : 'border-border'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          {authMode === 'password' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-caption text-muted-foreground hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-surface-2 border rounded-sm px-3.5 py-2.5 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                    errors.password ? 'border-status-crit focus:ring-status-crit' : 'border-border'
                  }`}
                />
              </div>
              {errors.password && (
                <span className="text-caption text-status-crit flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </span>
              )}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-accent-foreground border-t-transparent animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>{authMode === 'password' ? 'Sign In to StayO' : 'Send Magic Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-caption uppercase tracking-wider text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* Google SSO button */}
      <button
        type="button"
        onClick={() => router.push('/app/dashboard')}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-sm bg-surface-2 border border-border text-body-md font-medium text-foreground hover:bg-border transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 8.9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        <span>Google Workspace SSO</span>
      </button>

      {/* Onboarding Link */}
      <div className="text-center pt-2 text-body-sm text-muted-foreground">
        Setting up a new property?{' '}
        <Link href="/onboarding" className="text-accent hover:underline font-medium">
          Start property setup
        </Link>
      </div>
    </div>
  );
}



