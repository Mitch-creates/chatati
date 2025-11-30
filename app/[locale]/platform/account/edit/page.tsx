import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function EditPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <div>Edit account page</div>
    </Suspense>
  );
}

