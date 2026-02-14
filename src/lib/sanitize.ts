/** Strip HTML tags and encode dangerous characters to prevent XSS. */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Validate a score value is an integer between 1 and 15. */
export function isValidScore(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 15;
}

/** Validate a monetary amount: positive, max 2 decimal places. */
export function isValidAmount(value: number): boolean {
  if (value <= 0 || !Number.isFinite(value)) return false;
  const parts = String(value).split('.');
  return !parts[1] || parts[1].length <= 2;
}
