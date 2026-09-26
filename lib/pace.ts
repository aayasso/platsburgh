export function yearsToBuild(feasibleUnits: number, buildingPace: number): number {
  if (buildingPace < 50) {
    throw new Error("buildingPace slider minimum is 50");
  }
  return feasibleUnits / buildingPace;
}

export function formatPaceYears(years: number): string {
  return `${Math.round(years)} YEARS`;
}
