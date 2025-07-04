export function formatNumberShort(n: bigint): string {
    const num = Number(n);
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + 'K';
  return num.toLocaleString();
}