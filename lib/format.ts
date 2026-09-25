export function rp(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return (n * 100).toFixed(digits).replace('.', ',') + '%';
}

export function pcs(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '0 Pcs';
  return Math.round(n).toLocaleString('id-ID') + ' Pcs';
}

export function num(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return n.toLocaleString('id-ID', { maximumFractionDigits: digits });
}

export function gapClass(n: number | null | undefined): string {
  if (n === null || n === undefined) return '';
  return n >= 0 ? 'text-good' : 'text-bad';
}

export function achvClass(p: number | null | undefined): 'g' | 'o' | 'r' {
  if (p === null || p === undefined) return 'r';
  if (p >= 1) return 'g';
  if (p >= 0.7) return 'o';
  return 'r';
}
