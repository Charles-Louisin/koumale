"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { authApi } from "@/app/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    authApi.getMe()
      .then((res) => {
        if (!res.success || res.user?.role !== 'superAdmin') {
          router.replace('/');
        }
      })
      .catch(() => router.replace('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar pour mobile */}
      <div className="lg:hidden fixed top-2 right-2 z-50 bg-white hover:shadow-xl hover:shadow-gray-500 rounded-full p-2 cursor-pointer flex justify-center items-center ">
        <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-white" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-6 bg-white shadow-lg">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl p-1">
              <Image src="/images/logo.png" alt="Logo" fill className="object-contain rounded-lg" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold  text-gray-900 uppercase tracking-tight leading-none">KOUMALE</span>
              <span className="text-xs text-gray-600 font-medium">Administration</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="p-4 space-y-2 mt-5 gap-2">

          <Link href="/dashboard/admin" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin"
                ? "bg-orange-400 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <LayoutDashboard className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Tableau de bord</span>
            </div>
          </Link>

          <Link href="/dashboard/admin/vendors" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin/vendors"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin/vendors"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <Users className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin/vendors" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Vendeurs</span>
            </div>
          </Link>

          <Link href="/dashboard/admin/users" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin/users"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin/users"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <Users className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin/users" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Utilisateurs</span>
            </div>
          </Link>

          <Link href="/dashboard/admin/products" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin/products"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin/products"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <Package className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin/products" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Produits</span>
            </div>
          </Link>

          <Link href="/dashboard/admin/approvals" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin/approvals"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin/approvals"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <ShieldCheck className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin/approvals" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Approbations</span>
            </div>
          </Link>

          <Link href="/dashboard/admin/settings" onClick={() => setIsSidebarOpen(false)}>
            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
              pathname === "/dashboard/admin/settings"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "hover:bg-orange-50 text-gray-700 hover:text-orange-600 hover:shadow-md"
            }`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/dashboard/admin/settings"
                  ? "bg-white/20"
                  : "bg-orange-100 group-hover:bg-orange-200"
              }`}>
                <Settings className={`h-5 w-5 transition-colors ${
                  pathname === "/dashboard/admin/settings" ? "text-white" : "text-orange-600"
                }`} />
              </div>
              <span className="font-medium">Paramètres</span>
            </div>
          </Link>

          <div className="pt-6 mt-6 border-t border-orange-200">
          <div onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/';
          }} className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 group cursor-pointer">
            <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Déconnexion</span>
          </div>
          </div>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 pt-16 lg:pt-0 lg:ml-72">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
