// Single source of truth for which /app routes have a real page behind them.
// AppSidebar, the Dashboard, and the Command Palette all read this instead of
// keeping their own copy — one file to update when a route ships.
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
]);

export function isRouteBuilt(href: string): boolean {
  const path = href.split('?')[0].split('#')[0];
  return BUILT_ROUTES.has(path);
}
