import { Suspense } from "react";
import { Discover } from "./discover";

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <Discover />
    </Suspense>
  );
}
