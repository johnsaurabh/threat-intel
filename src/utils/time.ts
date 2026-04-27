export function formatAge(days: number | null): string | null {
  if (days === null) return null;
  if (days < 14) return `${days} days ago`;
  if (days < 60) {
    const weeks = Math.round(days / 7);
    return `${weeks} weeks ago`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `~${months} months ago`;
  }
  // Round to nearest half-year for readability
  const years = days / 365;
  const half = Math.round(years * 2) / 2;
  if (half === 1) return '~1 year ago';
  if (half % 1 === 0) return `~${half} years ago`;
  return `~${half} years ago`;
}
