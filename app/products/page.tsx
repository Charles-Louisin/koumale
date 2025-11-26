import { Suspense } from "react";
import ProductsPage from "./Productpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement des produits...</p>}>
      <ProductsPage />
    </Suspense>
  );
}
