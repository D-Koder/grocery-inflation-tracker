export function sanitizeStoreName(value: string): string {
  return value
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s'\-&.]/g, "")
    .slice(0, 100);
}

export function sanitizeSearchQuery(value: string): string {
  return value
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s'\-]/g, "")
    .slice(0, 100);
}

export function parsePrice(value: string | number): number | null {
  const num = typeof value === "string"
    ? parseFloat(value.replace(/[^0-9.]/g, ""))
    : value;
  if (isNaN(num) || num < 0 || num > 9999.99) return null;
  return Math.round(num * 100) / 100;
}

export function parseDate(value: string): string | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  if (date > new Date(Date.now() + 86400000)) return null;
  if (date < new Date("2010-01-01")) return null;
  return date.toISOString().split("T")[0];
}

export type ReceiptValidationResult =
  | { valid: true; data: { store: string; date: string; total: number } }
  | { valid: false; errors: Record<string, string> };

export function validateReceiptInput(input: {
  store: string;
  date: string;
  total: string | number;
}): ReceiptValidationResult {
  const errors: Record<string, string> = {};

  const store = sanitizeStoreName(input.store);
  if (!store || store.length < 1) errors.store = "Store name is required";
  if (store.length > 100) errors.store = "Store name is too long";

  const date = parseDate(input.date);
  if (!date) errors.date = "Please enter a valid date";

  const total = parsePrice(input.total);
  if (total === null) errors.total = "Please enter a valid total";

  if (Object.keys(errors).length > 0) return { valid: false, errors };
  return { valid: true, data: { store, date: date!, total: total! } };
}
