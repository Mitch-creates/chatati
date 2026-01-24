import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function Home() {
  return (
    <Suspense fallback={<Spinner />}>
      <button>Sign up</button>
    </Suspense>
  );
}
