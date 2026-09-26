export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtFt(n: number): string {
  return `${Math.round(n * 10) / 10}`;
}

export function dashIfEmpty(n: number | null | undefined, format: (v: number) => string): string {
  if (n == null || Number.isNaN(n)) return "—";
  return format(n);
}

export function metersToFt(m: number): number {
  return m * 3.280839895;
}
