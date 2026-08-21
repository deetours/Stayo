'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ShieldCheck, Building2, UserPlus, ArrowRight } from 'lucide-react';

export default function InviteAcceptancePage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  // Mock Invite Payload
  const invite = {
    inviterName: 'Vikram Mehta (Owner)',
    propertyName: 'The Himalayan Pines Resort',
    role: 'Front Desk Manager',
    permissions: [
      'Manage Reservations and Guest Directory',
      'Assign Rooms and Check-in Guests',
      'View & Send Guest Communications (WhatsApp / Inbox)',
      'Process Payments and Settle Folios',
    ],
  };

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-caption font-semibold uppercase tracking-wider mb-2">
          <UserPlus className="w-3.5 h-3.5" /> Team Invitation
        </div>
        <h2 className="text-heading-lg font-bold text-foreground tracking-tight">
          Join {invite.propertyName}
        </h2>
        <p className="text-body-sm text-muted-foreground mt-1">
          <span className="text-foreground font-medium">{invite.inviterName}</span> invited you to join as <span className="text-accent font-medium">{invite.role}</span>.
        </p>
      </div>

      {accepted ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 rounded-full bg-status-ok/15 border border-status-ok/30 text-status-ok flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-heading-sm font-semibold text-foreground">Invitation accepted!</h4>
          <p className="text-body-sm text-muted-foreground">
            Redirecting to your property command centre...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Role Preview Card */}
          <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
            <div className="flex items-center gap-2 text-body-md font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Role Permissions Preview</span>
            </div>
            <ul className="space-y-2 text-body-sm text-muted-foreground">
              {invite.permissions.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">ï¿½</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-2.5 rounded-sm bg-surface-2 border border-border text-muted-foreground hover:text-foreground text-body-md font-medium transition-colors cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <span>Accept & Join</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


