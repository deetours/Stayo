'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Building2,
  Bed,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Globe,
  UserPlus,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  short: string;
}

const steps: Step[] = [
  { id: 1, title: 'Property Details', short: 'Property' },
  { id: 2, title: 'Room Types', short: 'Room Types' },
  { id: 3, title: 'Inventory Generator', short: 'Rooms' },
  { id: 4, title: 'Rates & Operations', short: 'Rates' },
  { id: 5, title: 'Channels & Messaging', short: 'Channels' },
  { id: 6, title: 'Team Members', short: 'Staff' },
  { id: 7, title: 'Launch Property', short: 'Finish' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [propertyName, setPropertyName] = useState('Off The Trail — Dalhousie');
  const [propertyType, setPropertyType] = useState('Boutique Resort');
  const [currency, setCurrency] = useState('INR (₹)');

  const [roomTypes, setRoomTypes] = useState([
    { id: '1', name: 'Deluxe Pine Suite', baseRate: 8500, capacity: 2 },
    { id: '2', name: 'Valley View Villa', baseRate: 14000, capacity: 4 },
  ]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeRate, setNewTypeRate] = useState('6500');

  // Bulk room generator state
  const [bulkCount, setBulkCount] = useState('8');
  const [bulkPrefix, setBulkPrefix] = useState('10');
  const [selectedBulkType, setSelectedBulkType] = useState('Deluxe Pine Suite');

  // Rates & Times
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [taxPercent, setTaxPercent] = useState('12');

  // Channels Connected
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [bookingDotComConnected, setBookingDotComConnected] = useState(false);
  const [airbnbConnected, setAirbnbConnected] = useState(false);

  // Staff
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Front Desk');
  const [invitedStaff, setInvitedStaff] = useState([
    { email: 'sunita@hotel.com', role: 'Housekeeping Manager' },
    { email: 'manoj@hotel.com', role: 'Front Desk' },
  ]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((c) => c + 1);
    } else {
      router.push('/app/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((c) => c - 1);
    }
  };

  const addRoomType = () => {
    if (!newTypeName.trim()) return;
    setRoomTypes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newTypeName,
        baseRate: Number(newTypeRate) || 5000,
        capacity: 2,
      },
    ]);
    setNewTypeName('');
  };

  const addStaff = () => {
    if (!staffEmail.trim()) return;
    setInvitedStaff((prev) => [...prev, { email: staffEmail, role: staffRole }]);
    setStaffEmail('');
  };

  // Generate room previews for Step 3
  const generatedRoomPreviews = Array.from({ length: Number(bulkCount) || 0 }).map((_, i) => {
    const num = `${bulkPrefix}${i + 1 < 10 ? '0' : ''}${i + 1}`;
    return { num, type: selectedBulkType };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Left Progress Rail */}
      <div className="w-full md:w-72 bg-surface border-r border-border p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold font-mono text-body-sm shadow-e1">
              S
            </div>
            <div>
              <span className="text-body-md font-bold tracking-tight text-foreground block">
                StayO Setup
              </span>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                Property Wizard
              </span>
            </div>
          </div>

          {/* Stepper list */}
          <div className="space-y-1.5">
            {steps.map((s) => {
              const isCompleted = s.id < currentStep;
              const isCurrent = s.id === currentStep;

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-body-sm ${
                    isCurrent
                      ? 'bg-surface-2 text-foreground font-semibold border border-border'
                      : isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground opacity-60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-status-ok text-background font-bold'
                        : isCurrent
                        ? 'bg-accent text-accent-foreground font-bold'
                        : 'bg-surface-2 border border-border text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.id}
                  </div>
                  <span className="truncate">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <button
            onClick={() => router.push('/app/dashboard')}
            className="text-caption text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Save progress & exit
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 overflow-y-auto max-w-3xl">
        <div className="max-w-xl mx-auto w-full space-y-8 my-auto">
          {/* STEP 1: PROPERTY DETAILS */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 1 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Property Information</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Tell us the name and type of property you are managing.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. Pine Valley Homestay"
                    className="w-full bg-surface border border-border rounded-sm px-4 py-2.5 text-body-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                      Property Category
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full bg-surface border border-border rounded-sm px-3.5 py-2.5 text-body-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                      <option>Boutique Resort</option>
                      <option>Hotel</option>
                      <option>Homestay</option>
                      <option>Cabin & Villas</option>
                      <option>Hostel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
                      Operating Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-surface border border-border rounded-sm px-3.5 py-2.5 text-body-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ROOM TYPES */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 2 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Configure Room Types</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Define the categories of rooms or units available at {propertyName}.
                </p>
              </div>

              {/* Room Types List */}
              <div className="space-y-2">
                {roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    className="flex items-center justify-between p-3.5 rounded-md bg-surface border border-border shadow-e0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-surface-2 flex items-center justify-center text-accent">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-body-md text-foreground">{rt.name}</div>
                        <div className="text-caption text-muted-foreground">Standard 2 Guests</div>
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-body-md text-accent">
                      ?{rt.baseRate.toLocaleString()}/night
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Type */}
              <div className="p-4 rounded-md bg-surface border border-dashed border-border space-y-3">
                <div className="text-body-sm font-semibold text-foreground">Add Another Room Type</div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="e.g. Attic Loft"
                    className="col-span-2 bg-surface-2 border border-border rounded-sm px-3 py-2 text-body-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="number"
                    value={newTypeRate}
                    onChange={(e) => setNewTypeRate(e.target.value)}
                    placeholder="Base Rate"
                    className="bg-surface-2 border border-border rounded-sm px-3 py-2 text-body-md text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Type
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FAST BULK ROOM GENERATOR */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 3 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Bulk Room Generator</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Quickly auto-number and instantiate room units in seconds.
                </p>
              </div>

              <div className="p-4 rounded-md bg-surface border border-border space-y-4 shadow-e0">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground">Quantity</label>
                    <input
                      type="number"
                      value={bulkCount}
                      onChange={(e) => setBulkCount(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 text-body-md text-foreground font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground">Floor / Prefix</label>
                    <input
                      type="text"
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 text-body-md text-foreground font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground">Assign Type</label>
                    <select
                      value={selectedBulkType}
                      onChange={(e) => setSelectedBulkType(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-sm px-2.5 py-2 text-body-md text-foreground"
                    >
                      {roomTypes.map((rt) => (
                        <option key={rt.id}>{rt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Preview Strip */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="text-caption uppercase tracking-wider text-muted-foreground">
                    Generated Preview ({generatedRoomPreviews.length} rooms)
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-surface-2 rounded-sm border border-border">
                    {generatedRoomPreviews.map((r, i) => (
                      <span
                        key={i}
                        className="font-mono text-body-sm px-2.5 py-1 rounded-sm bg-surface border border-border text-foreground"
                      >
                        Room {r.num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RATES & OPERATIONS */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 4 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Operational Rules</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Default check-in times and tax configuration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground">Check-in Time</label>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full bg-surface border border-border rounded-sm px-3.5 py-2 text-body-md text-foreground font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption uppercase tracking-wider text-muted-foreground">Check-out Time</label>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full bg-surface border border-border rounded-sm px-3.5 py-2 text-body-md text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-caption uppercase tracking-wider text-muted-foreground">GST / Hospitality Tax (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm px-3.5 py-2 text-body-md text-foreground font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: CHANNELS & WHATSAPP */}
          {currentStep === 5 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 5 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Channels & WhatsApp</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Connect direct messaging and OTA booking channels.
                </p>
              </div>

              <div className="space-y-3">
                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 rounded-md bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-status-ok/15 text-status-ok flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-body-md text-foreground">WhatsApp Business API</div>
                      <div className="text-caption text-muted-foreground">Direct automated guest concierge & booking confirmations</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhatsappConnected(!whatsappConnected)}
                    className={`px-3 py-1.5 rounded-sm text-body-sm font-medium transition-all cursor-pointer ${
                      whatsappConnected
                        ? 'bg-status-ok/15 text-status-ok border border-status-ok/30'
                        : 'bg-surface-2 border border-border text-foreground hover:bg-border'
                    }`}
                  >
                    {whatsappConnected ? '✓ Connected' : 'Connect'}
                  </button>
                </div>

                {/* Booking.com */}
                <div className="flex items-center justify-between p-4 rounded-md bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-status-info/15 text-status-info flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-body-md text-foreground">Booking.com 2-Way Sync</div>
                      <div className="text-caption text-muted-foreground">Sync rates, availability, and instant reservations</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingDotComConnected(!bookingDotComConnected)}
                    className={`px-3 py-1.5 rounded-sm text-body-sm font-medium transition-all cursor-pointer ${
                      bookingDotComConnected
                        ? 'bg-status-ok/15 text-status-ok border border-status-ok/30'
                        : 'bg-surface-2 border border-border text-foreground hover:bg-border'
                    }`}
                  >
                    {bookingDotComConnected ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: STAFF MEMBERS */}
          {currentStep === 6 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <span className="text-caption font-semibold uppercase tracking-wider text-accent">Step 6 of 7</span>
                <h2 className="text-display-md font-bold text-foreground mt-1">Invite Team Members</h2>
                <p className="text-body-md text-muted-foreground mt-1">
                  Add staff to manage front desk, housekeeping, and kitchen tickets.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="colleague@hotel.com"
                  className="flex-1 bg-surface border border-border rounded-sm px-3.5 py-2 text-body-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="bg-surface border border-border rounded-sm px-3 py-2 text-body-md text-foreground cursor-pointer"
                >
                  <option>Front Desk</option>
                  <option>Housekeeping Manager</option>
                  <option>Maintenance</option>
                  <option>General Manager</option>
                </select>
                <button
                  type="button"
                  onClick={addStaff}
                  className="px-4 py-2 rounded-sm bg-accent text-accent-foreground font-medium text-body-sm hover:opacity-90 transition-all cursor-pointer"
                >
                  Invite
                </button>
              </div>

              <div className="space-y-2">
                {invitedStaff.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-md bg-surface border border-border"
                  >
                    <span className="font-mono text-body-sm text-foreground">{s.email}</span>
                    <span className="text-caption px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-muted-foreground">
                      {s.role}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 7: LAUNCH */}
          {currentStep === 7 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-e2">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-display-md font-bold text-foreground">Property Ready to Launch!</h2>
                <p className="text-body-md text-muted-foreground mt-2 max-w-md mx-auto">
                  <span className="text-foreground font-medium">{propertyName}</span> has been configured with {generatedRoomPreviews.length} rooms, automated WhatsApp notifications, and active team members.
                </p>
              </div>

              <div className="p-4 rounded-md bg-surface border border-border text-left space-y-2 max-w-md mx-auto text-body-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Inventory</span>
                  <span className="font-mono font-medium text-foreground">{generatedRoomPreviews.length} Rooms Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Concierge</span>
                  <span className="text-status-ok font-medium">Online (WhatsApp)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Scope</span>
                  <span className="font-mono text-foreground">{invitedStaff.length + 1} Staff Granted</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation CTAs */}
        <div className="max-w-xl mx-auto w-full flex items-center justify-between pt-6 border-t border-border/60 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-surface-2 border border-border text-muted-foreground hover:text-foreground text-body-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm bg-accent text-accent-foreground text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <span>{currentStep === 7 ? 'Enter Command Centre' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}



