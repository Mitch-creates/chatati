import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function DeletePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <div>Delete account page</div>
    </Suspense>
  );
}
