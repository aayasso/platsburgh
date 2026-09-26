export function annualTaxPerUnit(
  unitPrice: number,
  propertyTaxRate: number,
): number {
  return unitPrice * propertyTaxRate;
}

export function paybackYears(
  subsidyRequiredPerUnit: number,
  annualTax: number,
): number | null {
  if (subsidyRequiredPerUnit === 0) return null;
  if (annualTax === 0) return Number.POSITIVE_INFINITY;
  return subsidyRequiredPerUnit / annualTax;
}

export function formatPayback(years: number | null): string {
  if (years === null) return "no subsidy required";
  return `${Math.round(years)} YEARS`;
}

export function citywidePublicReturn(
  parcels: { subsidyForAffordable: number; units: number; annualTaxPerUnit: number }[],
): {
  totalSubsidy: number;
  annualTax: number;
  medianPayback: number | null;
} {
  const totalSubsidy = parcels.reduce(
    (s, p) => s + p.subsidyForAffordable * p.units,
    0,
  );
  const annualTax = parcels.reduce(
    (s, p) => s + p.annualTaxPerUnit * p.units,
    0,
  );
  const paybacks = parcels
    .map((p) => paybackYears(p.subsidyForAffordable, p.annualTaxPerUnit))
    .filter((y): y is number => y !== null)
    .sort((a, b) => a - b);
  const medianPayback =
    paybacks.length === 0
      ? null
      : paybacks.length % 2 === 1
        ? paybacks[(paybacks.length - 1) / 2]
        : (paybacks[paybacks.length / 2 - 1] + paybacks[paybacks.length / 2]) / 2;
  return { totalSubsidy, annualTax, medianPayback };
}
