"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ToastContainer } from "../ui/toast";
import { useToast, ToastProvider } from "@/app/contexts/ToastContext";
import { CartProvider } from "@/app/contexts/CartContext";

function ToastWrapper() {
  const toastResult = useToast();
  const { toasts, removeToast } = toastResult;
  
  React.useEffect(() => {
    console.log('[ToastWrapper] useToast result:', toastResult);
    console.log('[ToastWrapper] Toasts changed:', toasts);
    console.log('[ToastWrapper] Number of toasts:', toasts.length);
  }, [toasts, toastResult]);
  
  // Vérifier si le contexte est disponible
  React.useEffect(() => {
    console.log('[ToastWrapper] Component mounted, toasts:', toasts);
    console.log('[ToastWrapper] Full toastResult:', toastResult);
  }, []);
  
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isCartRoute = pathname === "/cart";

  return (
    <ToastProvider>
      <CartProvider>
        {!isAuthRoute && !isDashboardRoute && <Navbar />}
        <main className={isAuthRoute || isDashboardRoute ? "min-h-screen" : "min-h-[calc(100vh-600px)] pt-72 md:pt-80"}>
          {children}
        </main>
        {!isAuthRoute && !isDashboardRoute && !isCartRoute && <Footer />}
      </CartProvider>
      <ToastWrapper />
    </ToastProvider>
  );
}

