import { dashIfEmpty, fmtInt, fmtMoney } from "@/lib/format";
import type { LadderModel } from "@/lib/evaluate";

export function Ladder({ ladder }: { ladder: LadderModel }) {
  const empty = ladder.empty;
  const yearsBuild = empty
    ? "—"
    : dashIfEmpty(ladder.yearsToBuild, (v) => String(Math.round(v)));
  const yearsPay = empty
    ? "—"
    : dashIfEmpty(ladder.paybackYears, (v) => String(Math.round(v)));
  const showBuildTag = !empty && ladder.yearsToBuild != null;
  const showPayTag = !empty && ladder.paybackYears != null;
  return (
    <table className="shrink-0 border-separate border-spacing-x-5 border-spacing-y-0">
      <thead>
        <tr className="font-display text-[10px] tracking-caps text-limestone/50">
          <th className="pb-1 text-left font-semibold" />
          <th className="pb-1 text-right font-semibold">UNITS</th>
          <th className="pb-1 text-right font-semibold">PARCELS</th>
          <th className="pb-1 text-right font-semibold">YEARS</th>
        </tr>
      </thead>
      <tbody className="font-display tabular-nums">
        <tr>
          <td className="whitespace-nowrap pr-4 text-left text-[22px] font-bold tracking-ladder text-limestone">
            CONFORMING
          </td>
          <td className="min-w-[5.5rem] whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.conformingUnits, fmtInt)}
          </td>
          <td className="min-w-[5.5rem] whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.conformingParcels, fmtInt)}
          </td>
          <td className="min-w-[7rem] whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            —
          </td>
        </tr>
        <tr>
          <td className="whitespace-nowrap pr-4 text-left text-[22px] font-bold tracking-ladder text-limestone">
            FEASIBLE
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.feasibleUnits, fmtInt)}
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.feasibleParcels, fmtInt)}
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {showBuildTag ? (
              <span className="inline-flex items-baseline gap-2">
                {yearsBuild}
                <span className="font-display text-[11px] font-semibold tracking-section text-limestone/70">
                  TO BUILD
                </span>
              </span>
            ) : (
              yearsBuild
            )}
          </td>
        </tr>
        <tr>
          <td className="whitespace-nowrap pr-4 text-left text-[22px] font-bold tracking-ladder text-limestone">
            AFFORDABLE
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.affordableUnits, fmtInt)}
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.affordableParcels, fmtInt)}
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            —
          </td>
        </tr>
        <tr>
          <td className="whitespace-nowrap pr-4 text-left text-[22px] font-bold tracking-ladder text-limestone">
            SUBSIDY / UNIT
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {dashIfEmpty(ladder.subsidyPerUnit, fmtMoney)}
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            —
          </td>
          <td className="whitespace-nowrap text-right text-[24px] font-bold text-centerline">
            {showPayTag ? (
              <span className="inline-flex items-baseline gap-2">
                {yearsPay}
                <span className="font-display text-[11px] font-semibold tracking-section text-limestone/70">
                  PAYBACK
                </span>
              </span>
            ) : (
              yearsPay
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
