// Single source of truth for which /app routes have a real page behind them.
// AppSidebar, the Dashboard, and the Command Palette all read this instead of
// keeping their own copy — one file to update when a route ships.
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
  '/app/guests',
  '/app/billing',
  '/app/service-requests',
  '/app/maintenance',
  '/app/payments',
  '/app/rates',
  '/app/revenue',
  '/app/reports',
  '/app/communications',
  '/app/restaurant',
  '/app/experiences',
  '/app/staff',
  '/app/channels',
  '/app/settings',
  '/app/calendar',
  '/app/ai',
  '/app/automations',
]);

export function isRouteBuilt(href: string): boolean {
  const path = href.split('?')[0].split('#')[0];
  return BUILT_ROUTES.has(path);
}
