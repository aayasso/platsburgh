export function hslToken(name: string, alpha?: number): string {
  if (typeof window === "undefined") {
    return alpha == null ? `hsl(0 0% 20%)` : `hsl(0 0% 20% / ${alpha})`;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return alpha == null ? `hsl(${raw})` : `hsl(${raw} / ${alpha})`;
}

export function tokenPalette() {
  return {
    pine: hslToken("--pine"),
    limestone: hslToken("--limestone"),
    limestoneDark: hslToken("--limestone-dark"),
    brick: hslToken("--brick"),
    centerline: hslToken("--centerline"),
    mapBg: hslToken("--map-bg"),
  };
}
