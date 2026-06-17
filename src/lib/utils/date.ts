import { formatInTimeZone } from "date-fns-tz";

const MANILA_TZ = "Asia/Manila";

export function manilaToday(): string {
  return formatInTimeZone(new Date(), MANILA_TZ, "yyyy-MM-dd");
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, MANILA_TZ, "MMM d, yyyy");
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, MANILA_TZ, "h:mm a");
}
