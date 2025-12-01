"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Package, Users, ShieldCheck, AlertCircle, TrendingUp, Activity, BarChart3, Eye } from "lucide-react";
import { adminApi, productsApi, vendorsApi } from "@/app/lib/api";

type PendingVendorRow = { _id: string; businessName: string; user: { _id: string; email: string; createdAt: string } };
type ApiPendingVendor = { _id: string; businessName: string; user: { _id: string; email: string; createdAt: string } };
type PendingResponse = { success: boolean; data?: ApiPendingVendor[]; total?: number; count?: number };
type CountTotalResponse = { success: boolean; total?: number; count?: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<{ totalVendors: number; totalProducts: number; pendingApprovals: number; totalUsers: number }>({ totalVendors: 0, totalProducts: 0, pendingApprovals: 0, totalUsers: 0 });
  const [pendingVendors, setPendingVendors] = React.useState<PendingVendorRow[]>([]);

  React.useEffect(() => {
    // Charger en parallèle: vendeurs en attente, total vendeurs, total produits, total utilisateurs
    Promise.all([
      adminApi.getPendingVendors(1, 5),
      vendorsApi.list({ page: 1, limit: 1 }),
      productsApi.list({ page: 1, limit: 1 }),
      adminApi.listUsers({ page: 1, limit: 1 }),
    ]).then((responses) => {
      const [pendingRaw, vendorsRaw, productsRaw, usersRaw] = responses as [PendingResponse, CountTotalResponse, CountTotalResponse, CountTotalResponse];
      const pRes = pendingRaw as unknown as PendingResponse;
      if (pRes.success) {
        const arr: ApiPendingVendor[] = Array.isArray(pRes.data) ? pRes.data : [];
        const totalPending: number = typeof pRes.total === 'number' ? pRes.total : 0;
        const rows: PendingVendorRow[] = arr.map((v) => ({ _id: v._id, businessName: v.businessName, user: { _id: v.user._id, email: v.user.email, createdAt: v.user.createdAt } }));
        setPendingVendors(rows);
        setStats((s) => ({ ...s, pendingApprovals: totalPending }));
      }
      const vRes = vendorsRaw as CountTotalResponse | undefined;
      if (vRes?.success) {
        const total = typeof vRes.total === 'number' ? vRes.total : 0;
        setStats((s) => ({ ...s, totalVendors: typeof total === 'number' ? total : 0 }));
      }
      const prRes = productsRaw as CountTotalResponse | undefined;
      if (prRes?.success) {
        const total = typeof prRes.total === 'number' ? prRes.total : 0;
        setStats((s) => ({ ...s, totalProducts: typeof total === 'number' ? total : 0 }));
      }
      const uRes = usersRaw as CountTotalResponse | undefined;
      if (uRes?.success) {
        const total = typeof uRes.total === 'number' ? uRes.total : 0;
        setStats((s) => ({ ...s, totalUsers: typeof total === 'number' ? total : 0 }));
      }
    });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Tableau de bord</h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Bienvenue dans votre espace d&apos;administration. Gérez efficacement votre plateforme avec des insights en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Vendeurs actifs</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats.totalVendors}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Produits</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Approbations</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats.pendingApprovals}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Utilisateurs</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Actions rapides</CardTitle>
              <CardDescription>Accès rapide aux tâches importantes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/dashboard/admin/approvals">
                <Button className="w-full justify-start h-12 cursor-pointer hover:bg-orange-500 text-white border-0">
                  <ShieldCheck className="w-5 h-5 mr-3" />
                  Gérer les approbations
                </Button>
              </Link>
              <Link href="/dashboard/admin/vendors">
                <Button variant="outline" className="w-full cursor-pointer justify-start h-12 border-2 hover:bg-orange-50">
                  <Users className="w-5 h-5 mr-3" />
                  Voir les vendeurs
                </Button>
              </Link>
              <Link href="/dashboard/admin/products">
                <Button variant="outline" className="w-full cursor-pointer justify-start h-12 border-2 hover:bg-orange-50">
                  <Package className="w-5 h-5 mr-3" />
                  Gérer les produits
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full cursor-pointer justify-start h-12 border-2 hover:bg-orange-50">
                  <Users className="w-5 h-5 mr-3" />
                  Utilisateurs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Pending Approvals */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-6 h-6 text-amber-500 mr-2" />
                  Approbations récentes
                </CardTitle>
                <CardDescription>
                  Vendeurs en attente de validation ( {stats.pendingApprovals} )
                </CardDescription>
              </div>
              <Link href="/dashboard/admin/approvals">
                <Button variant="outline" size="sm" className="border-2">
                  Voir tout
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingVendors.length > 0 ? (
                <div className="space-y-4">
                  {pendingVendors.slice(0, 3).map((vendor) => (
                    <div key={vendor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {vendor.businessName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vendor.businessName}</p>
                          <p className="text-sm text-gray-600">{vendor.user.email}</p>
                          <p className="text-xs text-gray-500">
                            Inscrit le {new Date(vendor.user.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 hover:bg-white"
                          onClick={() => adminApi.approveVendor(vendor.user._id).then(() => setPendingVendors(p => p.filter(v => v._id !== vendor._id)))}
                        >
                          Approuver
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stats.pendingApprovals > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/admin/approvals">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                          Voir {stats.pendingApprovals - 3} autres demandes →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Tout est à jour !</p>
                  <p className="text-gray-600">Aucune approbation en attente pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
