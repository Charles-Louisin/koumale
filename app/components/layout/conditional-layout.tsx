"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");
  const isDashboardRoute = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isAuthRoute && !isDashboardRoute && <Navbar />}
      <main className={isAuthRoute || isDashboardRoute ? "min-h-screen" : "min-h-[calc(100vh-600px)] pt-72 md:pt-80"}>
        {children}
      </main>
      {!isAuthRoute && !isDashboardRoute && <Footer />}
    </>
  );
}

