import {
  confirmBeforeYouAct,
  nextSteps,
} from "@/lib/nextSteps";
import type { Construction, FitResult, Lot, Regulations } from "@/lib/types";

export function ParcelNextSteps(props: {
  lot: Lot;
  fit: FitResult;
  construction: Construction;
  regulations: Regulations;
}) {
  const steps = nextSteps(props.lot, props.fit, props.construction, props.regulations);
  return (
    <>
      <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">
        NEXT STEPS
      </h2>
      <div className="mt-2">
        {steps.map((row) => (
          <div key={row.id} className="border-b border-limestone-dark py-2">
            <a href={row.href} className="font-sans text-[14px] underline">
              {row.text}
            </a>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">
        CONFIRM BEFORE YOU ACT
      </h2>
      <div className="mt-2">
        {confirmBeforeYouAct(props.lot).map((line) => (
          <div key={line} className="border-b border-limestone-dark py-2 font-sans text-[14px]">
            {line}
          </div>
        ))}
      </div>
    </>
  );
}
