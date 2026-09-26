import { Suspense } from "react";
import { Workspace } from "@/components/workspace/Workspace";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center bg-pine p-8 font-sans text-limestone">
          Loading parcels…
        </div>
      }
    >
      <Workspace />
    </Suspense>
  );
}
