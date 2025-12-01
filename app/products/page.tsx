import { Suspense } from "react";
import ProductsPage from "./Productpage";
import { SkeletonLoading } from "@/app/components/ui/skeleton-loading";

export default function Page() {
  return (
    <Suspense fallback={<SkeletonLoading type="products" count={12} />}>
      <ProductsPage />
    </Suspense>
  );
}
