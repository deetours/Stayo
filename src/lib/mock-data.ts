// Single source of truth for the "Off The Trail — Dalhousie" mock property.
// Previously this data was hand-duplicated (with disagreeing details) across
// CommandPalette, the dashboard, and the dev/patterns showcase. Anything that
// consumes fictional records for this property should import from here.

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'blocked';

export interface MockRoom {
  number: string;
  type: string;
  status: RoomStatus;
  rate: number;
}

export const ROOM_TYPE_RATES: Record<string, number> = {
  'Deluxe Pine Suite': 8500,
  'Forest Suite': 9500,
  'Valley View Villa': 14000,
  'Attic Loft': 11000,
};

export const mockRooms: MockRoom[] = ([
  { number: '101', type: 'Deluxe Pine Suite', status: 'dirty' },
  { number: '102', type: 'Forest Suite', status: 'occupied' },
  { number: '103', type: 'Valley View Villa', status: 'cleaning' },
  { number: '104', type: 'Attic Loft', status: 'occupied' },
  { number: '105', type: 'Deluxe Pine Suite', status: 'dirty' },
  { number: '106', type: 'Forest Suite', status: 'available' },
  { number: '107', type: 'Valley View Villa', status: 'occupied' },
  { number: '108', type: 'Attic Loft', status: 'occupied' },
  { number: '201', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '202', type: 'Forest Suite', status: 'occupied' },
  { number: '203', type: 'Valley View Villa', status: 'occupied' },
  { number: '204', type: 'Valley View Villa', status: 'blocked' },
  { number: '205', type: 'Attic Loft', status: 'occupied' },
  { number: '206', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '207', type: 'Forest Suite', status: 'occupied' },
  { number: '208', type: 'Deluxe Pine Suite', status: 'available' },
  { number: '301', type: 'Attic Loft', status: 'available' },
  { number: '302', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '303', type: 'Forest Suite', status: 'occupied' },
  { number: '304', type: 'Valley View Villa', status: 'occupied' },
  { number: '305', type: 'Attic Loft', status: 'occupied' },
  { number: '401', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '402', type: 'Forest Suite', status: 'occupied' },
  { number: '403', type: 'Valley View Villa', status: 'occupied' },
  { number: '404', type: 'Attic Loft', status: 'occupied' },
] as { number: string; type: string; status: RoomStatus }[]).map((r) => ({ ...r, rate: ROOM_TYPE_RATES[r.type] }));

export const TOTAL_ROOMS = mockRooms.length; // 25

export const roomStatusCounts: Record<RoomStatus, number> = {
  available: 0,
  occupied: 0,
  dirty: 0,
  cleaning: 0,
  blocked: 0,
};
for (const room of mockRooms) roomStatusCounts[room.status]++;

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type BookingChannel = 'Direct' | 'Booking.com' | 'WhatsApp' | 'Airbnb';

export interface MockReservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  channel: BookingChannel;
  amount: string;
}

export const mockReservations: MockReservation[] = [
  { id: 'RES-8921', guestName: 'Aarav Sharma', roomNumber: '102', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹14,200' },
  { id: 'RES-8922', guestName: 'Elena Rostova', roomNumber: '204', checkIn: 'Today', checkOut: '23 Aug', status: 'confirmed', channel: 'Booking.com', amount: '₹22,500' },
  { id: 'RES-8923', guestName: 'Vikram Mehta', roomNumber: '301', checkIn: 'Tomorrow', checkOut: '26 Aug', status: 'confirmed', channel: 'WhatsApp', amount: '₹18,000' },
  { id: 'RES-8924', guestName: 'Sarah Jenkins', roomNumber: '105', checkIn: '22 Aug', checkOut: '25 Aug', status: 'checked-out', channel: 'Airbnb', amount: '₹12,400' },
  { id: 'RES-8925', guestName: 'Rohan Gupta', roomNumber: '208', checkIn: '23 Aug', checkOut: '27 Aug', status: 'cancelled', channel: 'Direct', amount: '₹31,000' },
];

export type HousekeepingStatus = 'dirty' | 'cleaning' | 'inspected' | 'ready';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface MockHousekeepingTask {
  id: string;
  roomNumber: string;
  roomLabel: string;
  subtitle: string;
  status: HousekeepingStatus;
  priority: TaskPriority;
  assignee: { name: string; initials: string };
  meta?: string;
}

// Room 204 is excluded here on purpose — its maintenance emergency (see
// roomAlerts below) blocks it from the housekeeping workflow entirely.
export const mockHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'hk-101', roomNumber: '101', roomLabel: 'Room 101 · Deluxe Pine', subtitle: 'Departure at 11:00 AM', status: 'dirty', priority: 'urgent', assignee: { name: 'Sunita D.', initials: 'SD' }, meta: 'Next: 2:00 PM' },
  { id: 'hk-102', roomNumber: '102', roomLabel: 'Room 102 · Forest Suite', subtitle: 'Stayover refresh', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-103', roomNumber: '103', roomLabel: 'Room 103 · Valley View Villa', subtitle: 'Post-checkout deep clean', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-105', roomNumber: '105', roomLabel: 'Room 105 · Deluxe Pine', subtitle: 'Departure clean, VIP arriving next door at 15:30', status: 'dirty', priority: 'high', assignee: { name: 'Sunita D.', initials: 'SD' } },
  { id: 'hk-106', roomNumber: '106', roomLabel: 'Room 106 · Forest Suite', subtitle: 'Final inspection before release', status: 'inspected', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'hk-301', roomNumber: '301', roomLabel: 'Room 301 · Attic Loft', subtitle: 'Ready for check-in', status: 'ready', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
];

export interface RoomAlert {
  roomNumber: string;
  guestName: string;
  title: string;
  detail: string;
}

// The one operational fact tying Room 204 / Elena Rostova together across
// the dashboard, sidebar, and command palette — a maintenance emergency
// delaying her 14:00 arrival prep, not a routine clean.
export const room204Alert: RoomAlert = {
  roomNumber: '204',
  guestName: 'Elena Rostova',
  title: 'Maintenance emergency — Room 204 (Bathroom leak)',
  detail: 'Bathroom leak reported ahead of a 14:00 VIP arrival. Room is blocked pending repair.',
};

export interface MockGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  vip: boolean;
  totalStays: number;
  lastStay: string;
  totalSpend: string;
  notes?: string;
}

// One row per named guest already used across mockReservations, the
// dashboard, and CommandPalette — kept 1:1 so drilling from a guest into
// their stay history never hits an unknown name.
export const mockGuests: MockGuest[] = [
  { id: 'GST-001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', vip: true, totalStays: 4, lastStay: 'Today', totalSpend: '₹58,200', notes: 'Prefers quiet room away from elevator. Requested extra towels via WhatsApp concierge.' },
  { id: 'GST-002', name: 'Elena Rostova', email: 'elena.rostova@example.com', phone: '+91 90000 11223', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹22,500' },
  { id: 'GST-003', name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 98111 22334', vip: false, totalStays: 2, lastStay: 'Tomorrow', totalSpend: '₹32,000' },
  { id: 'GST-004', name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+1 415 555 0132', vip: false, totalStays: 1, lastStay: '25 Aug', totalSpend: '₹12,400' },
  { id: 'GST-005', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 99887 66554', vip: false, totalStays: 3, lastStay: '27 Aug', totalSpend: '₹31,000' },
];

export type FolioStatus = 'outstanding' | 'partial' | 'paid';

export interface MockFolio {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId: string;
  charges: { label: string; amount: number }[];
  totalPaid: number;
  status: FolioStatus;
}

export const mockFolios: MockFolio[] = [
  { id: 'FOL-442', guestName: 'Aarav Sharma', roomNumber: '102', reservationId: 'RES-8921', charges: [{ label: 'Room Charges', amount: 14200 }, { label: 'Restaurant', amount: 2200 }], totalPaid: 14200, status: 'partial' },
  { id: 'FOL-443', guestName: 'Elena Rostova', roomNumber: '204', reservationId: 'RES-8922', charges: [{ label: 'Room Charges', amount: 22500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-444', guestName: 'Vikram Mehta', roomNumber: '301', reservationId: 'RES-8923', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 18000, status: 'paid' },
  { id: 'FOL-445', guestName: 'Sarah Jenkins', roomNumber: '105', reservationId: 'RES-8924', charges: [{ label: 'Room Charges', amount: 12400 }], totalPaid: 12400, status: 'paid' },
  { id: 'FOL-446', guestName: 'Rohan Gupta', roomNumber: '208', reservationId: 'RES-8925', charges: [{ label: 'Room Charges', amount: 31000 }], totalPaid: 0, status: 'outstanding' },
];
