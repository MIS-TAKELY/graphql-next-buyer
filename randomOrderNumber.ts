// utils/orderNumber.ts
export function generateOrderNumber(): string {
  const now = new Date();

  // Date part: YYYYMMDD
  const datePart = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  // Time part: HHMMSS
  const timePart = now
    .toTimeString()
    .slice(0, 8)
    .replace(/:/g, "");

  // Random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Combined: ORD-YYYYMMDD-HHMMSS-RANDOM6
  return `ORD-${datePart}-${timePart}-${randomPart}`;
}
