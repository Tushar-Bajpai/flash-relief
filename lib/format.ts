// Fixed-locale number formatting.
// Bare `.toLocaleString()` depends on the runtime's ambient locale, which
// differs between the Node server (en-IN) and the browser (often en-US),
// causing React hydration mismatches. Always pass an explicit locale.
const LOCALE = 'en-IN'

export function formatNumber(value: number | bigint): string {
  return value.toLocaleString(LOCALE)
}
