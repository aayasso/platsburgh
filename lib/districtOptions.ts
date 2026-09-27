export function filterDistrictOptions(all: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((d) => d.toLowerCase().includes(q));
}
