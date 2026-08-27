// Per-property mock datasets for StayO's demo app. Everything a page needs
// for the *active* property comes through usePropertyData() — nothing here
// is imported directly by page/component code anymore.

import { usePropertyStore, type PropertyId } from './property-store';

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

export interface PropertyMeta {
  id: PropertyId;
  name: string;
  type: string;
}

export interface ActivityLogEntry {
  id: string;
  message: string;
  tone: 'ok' | 'info' | 'warn';
  timestamp: string;
}

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
  amountValue: number;
  guestCount?: number;
  arrivalTime?: string;
  departureTime?: string;
}

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

export interface RoomAlert {
  roomNumber: string;
  guestName: string;
  title: string;
  detail: string;
}

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

export type ServiceRequestStatus = 'open' | 'in-progress' | 'resolved';
export type ServiceRequestCategory = 'Housekeeping' | 'Maintenance' | 'F&B' | 'Concierge';

export interface MockServiceRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  title: string;
  category: ServiceRequestCategory;
  status: ServiceRequestStatus;
  priority: TaskPriority;
  waitingSince: string;
  assignee?: { name: string; initials: string };
}

export type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved';

export interface MockMaintenanceTicket {
  id: string;
  roomNumber: string;
  title: string;
  detail: string;
  status: MaintenanceStatus;
  priority: TaskPriority;
  reportedAt: string;
  assignee?: { name: string; initials: string };
}

export interface PropertyDataset {
  meta: PropertyMeta;
  mockRooms: MockRoom[];
  totalRooms: number;
  roomStatusCounts: Record<RoomStatus, number>;
  mockReservations: MockReservation[];
  mockGuests: MockGuest[];
  mockFolios: MockFolio[];
  mockHousekeepingTasks: MockHousekeepingTask[];
  mockServiceRequests: MockServiceRequest[];
  mockMaintenanceTickets: MockMaintenanceTicket[];
  signatureIncident: RoomAlert;
  activityLog: ActivityLogEntry[];
}

function computeRoomStatusCounts(rooms: MockRoom[]): Record<RoomStatus, number> {
  const counts: Record<RoomStatus, number> = { available: 0, occupied: 0, dirty: 0, cleaning: 0, blocked: 0 };
  for (const room of rooms) counts[room.status]++;
  return counts;
}

// ---------------------------------------------------------------------------
// Off The Trail — Dalhousie (Boutique Resort, 25 rooms)
// ---------------------------------------------------------------------------

const offTheTrailRooms: MockRoom[] = ([
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

const offTheTrailReservations: MockReservation[] = [
  { id: 'RES-8921', guestName: 'Aarav Sharma', roomNumber: '102', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹14,200', amountValue: 14200, guestCount: 1, arrivalTime: '15:30' },
  { id: 'RES-8922', guestName: 'Elena Rostova', roomNumber: '204', checkIn: 'Today', checkOut: '23 Aug', status: 'confirmed', channel: 'Booking.com', amount: '₹22,500', amountValue: 22500, guestCount: 1, arrivalTime: '14:00' },
  { id: 'RES-8923', guestName: 'Vikram Mehta', roomNumber: '301', checkIn: 'Tomorrow', checkOut: '26 Aug', status: 'confirmed', channel: 'WhatsApp', amount: '₹18,000', amountValue: 18000, guestCount: 2 },
  { id: 'RES-8924', guestName: 'Sarah Jenkins', roomNumber: '105', checkIn: '18 Aug', checkOut: 'Today', status: 'checked-out', channel: 'Airbnb', amount: '₹12,400', amountValue: 12400, guestCount: 1, departureTime: '11:00' },
  { id: 'RES-8925', guestName: 'Rohan Gupta', roomNumber: '208', checkIn: '23 Aug', checkOut: '27 Aug', status: 'cancelled', channel: 'Direct', amount: '₹31,000', amountValue: 31000, guestCount: 1 },
  { id: 'RES-8926', guestName: 'Priya Nair', roomNumber: '107', checkIn: '19 Aug', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹19,000', amountValue: 19000, guestCount: 2 },
  { id: 'RES-8927', guestName: 'Marcus Webb', roomNumber: '108', checkIn: '20 Aug', checkOut: '26 Aug', status: 'checked-in', channel: 'Booking.com', amount: '₹27,500', amountValue: 27500, guestCount: 2 },
  { id: 'RES-8928', guestName: 'Ananya Iyer', roomNumber: '201', checkIn: '18 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹21,000', amountValue: 21000, guestCount: 1 },
  { id: 'RES-8929', guestName: 'Devika Menon', roomNumber: '202', checkIn: '17 Aug', checkOut: '25 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹33,000', amountValue: 33000, guestCount: 2 },
  { id: 'RES-8930', guestName: 'Karan Bedi', roomNumber: '203', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹16,500', amountValue: 16500, guestCount: 1 },
  { id: 'RES-8931', guestName: 'Fatima Sheikh', roomNumber: '205', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'WhatsApp', amount: '₹21,500', amountValue: 21500, guestCount: 2 },
  { id: 'RES-8932', guestName: 'Oliver Grant', roomNumber: '206', checkIn: '20 Aug', checkOut: '25 Aug', status: 'checked-in', channel: 'Booking.com', amount: '₹20,500', amountValue: 20500, guestCount: 1 },
  { id: 'RES-8933', guestName: 'Meera Kulkarni', roomNumber: '207', checkIn: 'Today', checkOut: '25 Aug', status: 'confirmed', channel: 'Direct', amount: '₹15,200', amountValue: 15200, guestCount: 1 },
];

// Room 204 is excluded here on purpose — its maintenance emergency (see
// offTheTrailSignatureIncident below) blocks it from the housekeeping
// workflow entirely.
const offTheTrailHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'hk-101', roomNumber: '101', roomLabel: 'Room 101 · Deluxe Pine', subtitle: 'Departure at 11:00 AM', status: 'dirty', priority: 'urgent', assignee: { name: 'Sunita D.', initials: 'SD' }, meta: 'Next: 2:00 PM' },
  { id: 'hk-102', roomNumber: '102', roomLabel: 'Room 102 · Forest Suite', subtitle: 'Stayover refresh', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-103', roomNumber: '103', roomLabel: 'Room 103 · Valley View Villa', subtitle: 'Post-checkout deep clean', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-105', roomNumber: '105', roomLabel: 'Room 105 · Deluxe Pine', subtitle: 'Departure clean, VIP arriving next door at 15:30', status: 'dirty', priority: 'high', assignee: { name: 'Sunita D.', initials: 'SD' } },
  { id: 'hk-106', roomNumber: '106', roomLabel: 'Room 106 · Forest Suite', subtitle: 'Final inspection before release', status: 'inspected', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'hk-301', roomNumber: '301', roomLabel: 'Room 301 · Attic Loft', subtitle: 'Ready for check-in', status: 'ready', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
];

const offTheTrailSignatureIncident: RoomAlert = {
  roomNumber: '204',
  guestName: 'Elena Rostova',
  title: 'Maintenance emergency — Room 204 (Bathroom leak)',
  detail: 'Bathroom leak reported ahead of a 14:00 VIP arrival. Room is blocked pending repair.',
};

// One row per named guest already used across offTheTrailReservations —
// kept 1:1 so the Guests page's "In-House" count never disagrees with the
// Dashboard's In-House Guests KPI.
const offTheTrailGuests: MockGuest[] = [
  { id: 'GST-001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', vip: true, totalStays: 4, lastStay: 'Today', totalSpend: '₹58,200', notes: 'Prefers quiet room away from elevator. Requested extra towels via WhatsApp concierge.' },
  { id: 'GST-002', name: 'Elena Rostova', email: 'elena.rostova@example.com', phone: '+91 90000 11223', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹22,500' },
  { id: 'GST-003', name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 98111 22334', vip: false, totalStays: 2, lastStay: 'Tomorrow', totalSpend: '₹32,000' },
  { id: 'GST-004', name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+1 415 555 0132', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹12,400' },
  { id: 'GST-005', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 99887 66554', vip: false, totalStays: 3, lastStay: '27 Aug', totalSpend: '₹31,000' },
  { id: 'GST-006', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98450 11223', vip: false, totalStays: 2, lastStay: '19 Aug', totalSpend: '₹34,000' },
  { id: 'GST-007', name: 'Marcus Webb', email: 'marcus.webb@example.com', phone: '+44 7700 900123', vip: false, totalStays: 1, lastStay: '20 Aug', totalSpend: '₹27,500' },
  { id: 'GST-008', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91 99001 22334', vip: false, totalStays: 3, lastStay: '18 Aug', totalSpend: '₹58,000' },
  { id: 'GST-009', name: 'Devika Menon', email: 'devika.menon@example.com', phone: '+91 98220 33445', vip: false, totalStays: 2, lastStay: '17 Aug', totalSpend: '₹61,000' },
  { id: 'GST-010', name: 'Karan Bedi', email: 'karan.bedi@example.com', phone: '+91 98111 55667', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹16,500' },
  { id: 'GST-011', name: 'Fatima Sheikh', email: 'fatima.sheikh@example.com', phone: '+91 97400 88990', vip: false, totalStays: 2, lastStay: '19 Aug', totalSpend: '₹40,500' },
  { id: 'GST-012', name: 'Oliver Grant', email: 'oliver.grant@example.com', phone: '+44 7911 123456', vip: false, totalStays: 1, lastStay: '20 Aug', totalSpend: '₹20,500' },
  { id: 'GST-013', name: 'Meera Kulkarni', email: 'meera.kulkarni@example.com', phone: '+91 98765 22110', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹15,200' },
];

const offTheTrailFolios: MockFolio[] = [
  { id: 'FOL-442', guestName: 'Aarav Sharma', roomNumber: '102', reservationId: 'RES-8921', charges: [{ label: 'Room Charges', amount: 14200 }, { label: 'Restaurant', amount: 2200 }], totalPaid: 14200, status: 'partial' },
  { id: 'FOL-443', guestName: 'Elena Rostova', roomNumber: '204', reservationId: 'RES-8922', charges: [{ label: 'Room Charges', amount: 22500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-444', guestName: 'Vikram Mehta', roomNumber: '301', reservationId: 'RES-8923', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 18000, status: 'paid' },
  { id: 'FOL-445', guestName: 'Sarah Jenkins', roomNumber: '105', reservationId: 'RES-8924', charges: [{ label: 'Room Charges', amount: 12400 }], totalPaid: 12400, status: 'paid' },
  { id: 'FOL-446', guestName: 'Rohan Gupta', roomNumber: '208', reservationId: 'RES-8925', charges: [{ label: 'Room Charges', amount: 31000 }], totalPaid: 0, status: 'outstanding' },
];

// SR-501 and SR-502 are the "2 guest requests waiting" the Dashboard's
// Needs Attention feed derives its count from.
const offTheTrailServiceRequests: MockServiceRequest[] = [
  { id: 'SR-501', roomNumber: '204', guestName: 'Elena Rostova', title: 'Extra towels requested', category: 'Housekeeping', status: 'open', priority: 'urgent', waitingSince: '22 min ago' },
  { id: 'SR-502', roomNumber: '102', guestName: 'Aarav Sharma', title: 'Late checkout to 1:00 PM', category: 'Concierge', status: 'open', priority: 'high', waitingSince: '21 min ago' },
  { id: 'SR-503', roomNumber: '301', guestName: 'Vikram Mehta', title: 'Room service — breakfast for 2', category: 'F&B', status: 'in-progress', priority: 'normal', waitingSince: '8 min ago', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'SR-504', roomNumber: '105', guestName: 'Sarah Jenkins', title: 'AC not cooling', category: 'Maintenance', status: 'resolved', priority: 'normal', waitingSince: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
];

const offTheTrailMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-901', roomNumber: offTheTrailSignatureIncident.roomNumber, title: 'Bathroom leak', detail: offTheTrailSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '12 min ago' },
  { id: 'MT-902', roomNumber: '105', title: 'AC not cooling', detail: 'Guest reports the AC unit is running but not cooling the room.', status: 'resolved', priority: 'high', reportedAt: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'MT-903', roomNumber: '303', title: 'Bathroom tap dripping', detail: 'Slow drip reported by housekeeping during turnover.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Rahul V.', initials: 'RV' } },
];

const offTheTrailActivityLog: ActivityLogEntry[] = [
  { id: 'ott-act-1', message: 'Reservation #8923 created by Concierge Agent via WhatsApp', tone: 'ok', timestamp: '4 min ago' },
  { id: 'ott-act-2', message: 'Room 101 cleaning completed by Sunita D.', tone: 'info', timestamp: '18 min ago' },
  { id: 'ott-act-3', message: 'Folio #442 updated with ₹2,200 Restaurant charge', tone: 'warn', timestamp: '32 min ago' },
  { id: 'ott-act-4', message: 'Bathroom leak reported for Room 204 by front desk', tone: 'warn', timestamp: '12 min ago' },
];

// ---------------------------------------------------------------------------
// Pine & Peaks Homestay (Homestay, 6 rooms)
// ---------------------------------------------------------------------------

const pinePeaksRooms: MockRoom[] = [
  { number: '1', type: 'Garden Room', status: 'occupied', rate: 4500 },
  { number: '2', type: 'Garden Room', status: 'available', rate: 4500 },
  { number: '3', type: 'Mountain View Room', status: 'occupied', rate: 5500 },
  { number: '4', type: 'Mountain View Room', status: 'dirty', rate: 5500 },
  { number: '5', type: 'Family Suite', status: 'occupied', rate: 7500 },
  { number: '6', type: 'Family Suite', status: 'blocked', rate: 7500 },
];

const pinePeaksReservations: MockReservation[] = [
  { id: 'RES-PP01', guestName: 'Neha Kapoor', roomNumber: '1', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹4,500', amountValue: 4500, guestCount: 1, arrivalTime: '13:00' },
  { id: 'RES-PP02', guestName: 'Thomas Reid', roomNumber: '6', checkIn: 'Today', checkOut: '25 Aug', status: 'confirmed', channel: 'Booking.com', amount: '₹7,500', amountValue: 7500, guestCount: 2, arrivalTime: '16:00' },
  { id: 'RES-PP03', guestName: 'Ritu Joshi', roomNumber: '3', checkIn: '20 Aug', checkOut: '24 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹5,500', amountValue: 5500, guestCount: 2 },
  { id: 'RES-PP04', guestName: 'George Abraham', roomNumber: '5', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹7,500', amountValue: 7500, guestCount: 1, departureTime: '10:30' },
];

const pinePeaksSignatureIncident: RoomAlert = {
  roomNumber: '6',
  guestName: 'Thomas Reid',
  title: 'Maintenance emergency — Room 6 (Water heater failure)',
  detail: 'Water heater failure discovered ahead of a 16:00 arrival. Room is blocked pending repair.',
};

const pinePeaksGuests: MockGuest[] = [
  { id: 'PPG-001', name: 'Neha Kapoor', email: 'neha.kapoor@example.com', phone: '+91 98230 11445', vip: true, totalStays: 3, lastStay: 'Today', totalSpend: '₹13,500', notes: 'Requests extra pillows and a quiet garden-facing room.' },
  { id: 'PPG-002', name: 'Thomas Reid', email: 'thomas.reid@example.com', phone: '+44 7700 900456', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹7,500' },
  { id: 'PPG-003', name: 'Ritu Joshi', email: 'ritu.joshi@example.com', phone: '+91 98111 66778', vip: false, totalStays: 2, lastStay: '20 Aug', totalSpend: '₹11,000' },
  { id: 'PPG-004', name: 'George Abraham', email: 'george.abraham@example.com', phone: '+91 94470 22110', vip: false, totalStays: 4, lastStay: 'Today', totalSpend: '₹28,000' },
];

const pinePeaksFolios: MockFolio[] = [
  { id: 'FOL-PP01', guestName: 'Neha Kapoor', roomNumber: '1', reservationId: 'RES-PP01', charges: [{ label: 'Room Charges', amount: 4500 }], totalPaid: 4500, status: 'paid' },
  { id: 'FOL-PP02', guestName: 'Thomas Reid', roomNumber: '6', reservationId: 'RES-PP02', charges: [{ label: 'Room Charges', amount: 7500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-PP03', guestName: 'George Abraham', roomNumber: '5', reservationId: 'RES-PP04', charges: [{ label: 'Room Charges', amount: 7500 }, { label: 'Breakfast', amount: 600 }], totalPaid: 7500, status: 'partial' },
];

const pinePeaksHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'pp-hk-2', roomNumber: '2', roomLabel: 'Room 2 · Garden Room', subtitle: 'Turnover clean before next arrival', status: 'cleaning', priority: 'normal', assignee: { name: 'Divya S.', initials: 'DS' } },
  { id: 'pp-hk-4', roomNumber: '4', roomLabel: 'Room 4 · Mountain View Room', subtitle: 'Departure clean, next guest at 16:00', status: 'dirty', priority: 'high', assignee: { name: 'Divya S.', initials: 'DS' } },
];

const pinePeaksServiceRequests: MockServiceRequest[] = [
  { id: 'SR-PP01', roomNumber: '3', guestName: 'Ritu Joshi', title: 'Extra blankets requested', category: 'Housekeeping', status: 'open', priority: 'normal', waitingSince: '15 min ago' },
];

const pinePeaksMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-PP01', roomNumber: pinePeaksSignatureIncident.roomNumber, title: 'Water heater failure', detail: pinePeaksSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '20 min ago' },
  { id: 'MT-PP02', roomNumber: '4', title: 'Loose door handle', detail: 'Guest reported the door handle is loose and sticks when locking.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Divya S.', initials: 'DS' } },
];

const pinePeaksActivityLog: ActivityLogEntry[] = [
  { id: 'pp-act-1', message: 'Reservation RES-PP02 created by Concierge Agent via Booking.com', tone: 'ok', timestamp: '6 min ago' },
  { id: 'pp-act-2', message: 'Room 2 cleaning started by Divya S.', tone: 'info', timestamp: '22 min ago' },
  { id: 'pp-act-3', message: 'Folio FOL-PP03 updated with ₹600 Breakfast charge', tone: 'warn', timestamp: '40 min ago' },
  { id: 'pp-act-4', message: 'Water heater failure reported for Room 6', tone: 'warn', timestamp: '20 min ago' },
];

// ---------------------------------------------------------------------------
// Wildflower Valley Cabin (Cabin Villa, 4 rooms)
// ---------------------------------------------------------------------------

const wildflowerRooms: MockRoom[] = [
  { number: '1', type: 'Standard Cabin', status: 'occupied', rate: 6000 },
  { number: '2', type: 'Standard Cabin', status: 'blocked', rate: 6000 },
  { number: '3', type: 'Deluxe Cabin', status: 'occupied', rate: 9000 },
  { number: '4', type: 'Deluxe Cabin', status: 'available', rate: 9000 },
];

const wildflowerReservations: MockReservation[] = [
  { id: 'RES-WV01', guestName: 'Karthik Iyer', roomNumber: '4', checkIn: 'Today', checkOut: '23 Aug', status: 'checked-in', channel: 'Direct', amount: '₹9,500', amountValue: 9500, guestCount: 1, arrivalTime: '13:30' },
  { id: 'RES-WV02', guestName: 'Daniel Cho', roomNumber: '2', checkIn: 'Today', checkOut: '24 Aug', status: 'confirmed', channel: 'WhatsApp', amount: '₹18,000', amountValue: 18000, guestCount: 2, arrivalTime: '15:00' },
  { id: 'RES-WV03', guestName: 'Ayesha Khan', roomNumber: '1', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹12,000', amountValue: 12000, guestCount: 2, departureTime: '10:00' },
  { id: 'RES-WV04', guestName: 'Meera Pillai', roomNumber: '3', checkIn: '21 Aug', checkOut: '26 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹27,000', amountValue: 27000, guestCount: 1 },
];

const wildflowerSignatureIncident: RoomAlert = {
  roomNumber: '2',
  guestName: 'Daniel Cho',
  title: 'Maintenance emergency — Cabin 2 (Propane heater malfunction)',
  detail: 'Propane heater malfunction discovered ahead of a 15:00 arrival. Cabin is blocked pending repair.',
};

const wildflowerGuests: MockGuest[] = [
  { id: 'WVG-001', name: 'Karthik Iyer', email: 'karthik.iyer@example.com', phone: '+91 98450 77889', vip: true, totalStays: 2, lastStay: 'Today', totalSpend: '₹19,000', notes: 'Requested a cabin close to the river trailhead.' },
  { id: 'WVG-002', name: 'Daniel Cho', email: 'daniel.cho@example.com', phone: '+1 415 555 0188', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹18,000' },
  { id: 'WVG-003', name: 'Ayesha Khan', email: 'ayesha.khan@example.com', phone: '+91 99000 44556', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹12,000' },
  { id: 'WVG-004', name: 'Meera Pillai', email: 'meera.pillai@example.com', phone: '+91 98220 99887', vip: false, totalStays: 3, lastStay: '21 Aug', totalSpend: '₹52,000' },
];

const wildflowerFolios: MockFolio[] = [
  { id: 'FOL-WV01', guestName: 'Karthik Iyer', roomNumber: '4', reservationId: 'RES-WV01', charges: [{ label: 'Room Charges', amount: 9500 }], totalPaid: 9500, status: 'paid' },
  { id: 'FOL-WV02', guestName: 'Daniel Cho', roomNumber: '2', reservationId: 'RES-WV02', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-WV03', guestName: 'Ayesha Khan', roomNumber: '1', reservationId: 'RES-WV03', charges: [{ label: 'Room Charges', amount: 12000 }, { label: 'Spa Treatment', amount: 1500 }], totalPaid: 12000, status: 'partial' },
];

const wildflowerHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'wv-hk-1', roomNumber: '1', roomLabel: 'Cabin 1 · Standard Cabin', subtitle: 'Pre-departure tidy ahead of 10:00 checkout', status: 'cleaning', priority: 'normal', assignee: { name: 'Tenzin L.', initials: 'TL' } },
];

const wildflowerServiceRequests: MockServiceRequest[] = [
  { id: 'SR-WV01', roomNumber: '3', guestName: 'Meera Pillai', title: 'Extra firewood for cabin stove', category: 'Concierge', status: 'open', priority: 'normal', waitingSince: '10 min ago' },
];

const wildflowerMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-WV01', roomNumber: wildflowerSignatureIncident.roomNumber, title: 'Propane heater malfunction', detail: wildflowerSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '25 min ago' },
  { id: 'MT-WV02', roomNumber: '3', title: 'Squeaky door hinge', detail: 'Cabin door hinge squeaks loudly when opened.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Tenzin L.', initials: 'TL' } },
];

const wildflowerActivityLog: ActivityLogEntry[] = [
  { id: 'wv-act-1', message: 'Reservation RES-WV02 created by Concierge Agent via WhatsApp', tone: 'ok', timestamp: '8 min ago' },
  { id: 'wv-act-2', message: 'Cabin 4 marked available after inspection', tone: 'ok', timestamp: '35 min ago' },
  { id: 'wv-act-3', message: 'Propane heater malfunction reported for Cabin 2', tone: 'warn', timestamp: '25 min ago' },
  { id: 'wv-act-4', message: 'Folio FOL-WV02 opened for Daniel Cho', tone: 'info', timestamp: '5 min ago' },
];

// ---------------------------------------------------------------------------
// Assembled datasets
// ---------------------------------------------------------------------------

export const propertyDatasets: Record<PropertyId, PropertyDataset> = {
  'off-the-trail': {
    meta: { id: 'off-the-trail', name: 'Off The Trail — Dalhousie', type: 'Boutique Resort' },
    mockRooms: offTheTrailRooms,
    totalRooms: offTheTrailRooms.length,
    roomStatusCounts: computeRoomStatusCounts(offTheTrailRooms),
    mockReservations: offTheTrailReservations,
    mockGuests: offTheTrailGuests,
    mockFolios: offTheTrailFolios,
    mockHousekeepingTasks: offTheTrailHousekeepingTasks,
    mockServiceRequests: offTheTrailServiceRequests,
    mockMaintenanceTickets: offTheTrailMaintenanceTickets,
    signatureIncident: offTheTrailSignatureIncident,
    activityLog: offTheTrailActivityLog,
  },
  'pine-peaks': {
    meta: { id: 'pine-peaks', name: 'Pine & Peaks Homestay', type: 'Homestay' },
    mockRooms: pinePeaksRooms,
    totalRooms: pinePeaksRooms.length,
    roomStatusCounts: computeRoomStatusCounts(pinePeaksRooms),
    mockReservations: pinePeaksReservations,
    mockGuests: pinePeaksGuests,
    mockFolios: pinePeaksFolios,
    mockHousekeepingTasks: pinePeaksHousekeepingTasks,
    mockServiceRequests: pinePeaksServiceRequests,
    mockMaintenanceTickets: pinePeaksMaintenanceTickets,
    signatureIncident: pinePeaksSignatureIncident,
    activityLog: pinePeaksActivityLog,
  },
  'wildflower-valley': {
    meta: { id: 'wildflower-valley', name: 'Wildflower Valley Cabin', type: 'Cabin Villa' },
    mockRooms: wildflowerRooms,
    totalRooms: wildflowerRooms.length,
    roomStatusCounts: computeRoomStatusCounts(wildflowerRooms),
    mockReservations: wildflowerReservations,
    mockGuests: wildflowerGuests,
    mockFolios: wildflowerFolios,
    mockHousekeepingTasks: wildflowerHousekeepingTasks,
    mockServiceRequests: wildflowerServiceRequests,
    mockMaintenanceTickets: wildflowerMaintenanceTickets,
    signatureIncident: wildflowerSignatureIncident,
    activityLog: wildflowerActivityLog,
  },
};

export function usePropertyData(): PropertyDataset {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return propertyDatasets[activePropertyId];
}
