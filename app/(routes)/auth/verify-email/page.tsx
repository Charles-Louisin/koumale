import { Suspense } from "react";
import VerifyEmail from "./verify-email";

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <VerifyEmail />
    </Suspense>
  );
}
