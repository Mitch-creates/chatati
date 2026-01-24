import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function DeactivatePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <div>Deactivate account page</div>
    </Suspense>
  );
}

