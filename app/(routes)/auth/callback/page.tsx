"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authStorage } from "@/app/lib/api";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/ui/toast";
import { Spinner } from "@/app/components/ui/Spinner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Stocker le token
      authStorage.setToken(token);

      // Récupérer les informations utilisateur depuis le token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = payload.user;

        success(`Bienvenu(e) ${user.firstName || ''} ${user.lastName || ''}`.trim() || "Connexion réussie !");

        // Rediriger selon le rôle
        setTimeout(() => {
          if (user.role === "vendor") {
            router.push("/dashboard/vendor");
          } else if (user.role === "superAdmin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/");
          }
        }, 500);
      } catch (err) {
        error("Erreur lors du traitement du token");
        router.push("/auth/login");
      }
    } else {
      error("Token manquant");
      router.push("/auth/login");
    }
  }, [searchParams, router, success, error]);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    </>
  );
}
