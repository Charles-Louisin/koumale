import { Suspense } from "react";
import AuthCallbackPage from "./AuthCallbackPage";

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <AuthCallbackPage />
    </Suspense>
  );
}
