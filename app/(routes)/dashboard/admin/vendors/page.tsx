"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { vendorsApi, productsApi } from "@/app/lib/api";
import { Search, Filter, Store, Package, TrendingUp, Eye, Phone, Calendar, ExternalLink, ChevronLeft, ChevronRight, Building2 } from "lucide-react";

type VendorRow = {
  _id: string;
  businessName: string;
  vendorSlug: string;
  contactPhone?: string;
  createdAt?: string;
  description?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
  productCount?: number;
};

type ApiVendor = {
  _id: string;
  businessName: string;
  vendorSlug: string;
  contactPhone?: string;
  createdAt?: string;
  description?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
};

export default function AdminVendorsPage() {
  const [rows, setRows] = React.useState<VendorRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [stats, setStats] = React.useState({
    totalVendors: 0,
    totalProducts: 0,
    avgProductsPerVendor: 0
  });

  const load = React.useCallback((p: number) => {
    setLoading(true);
    vendorsApi
      .list({ page: p, limit, q: q || undefined })
      .then(async (res) => {
        if (res.success && Array.isArray(res.data)) {
          const vendors = res.data as ApiVendor[];

          // Get product counts for each vendor
          const vendorsWithCounts = await Promise.all(
            vendors.map(async (v) => {
              try {
                const productsRes = await vendorsApi.getProducts(v.vendorSlug, { limit: 1 });
                const productCount = productsRes.success ? (productsRes.total || 0) : 0;
                return {
                  ...v,
                  productCount
                };
              } catch {
                return { ...v, productCount: 0 };
              }
            })
          );

          setRows(vendorsWithCounts);
          setTotal(typeof res.total === "number" ? res.total : 0);
        }
      })
      .finally(() => setLoading(false));
  }, [limit, q]);

  // Load stats separately
  React.useEffect(() => {
    const loadStats = async () => {
      const [vendorsRes, productsRes] = await Promise.all([
        vendorsApi.list({ page: 1, limit: 1 }),
        productsApi.list({ page: 1, limit: 1 })
      ]);

      const totalVendors = vendorsRes.success ? (vendorsRes.total || 0) : 0;
      const totalProducts = productsRes.success ? (productsRes.total || 0) : 0;
      const avgProductsPerVendor = totalVendors > 0 ? Math.round(totalProducts / totalVendors) : 0;

      setStats({
        totalVendors,
        totalProducts,
        avgProductsPerVendor
      });
    };
    loadStats();
  }, []);

  React.useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const clearFilters = () => {
    setQ('');
    setPage(1);
    load(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Gestion des Vendeurs</h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Supervisez et gérez toutes les boutiques de votre plateforme avec des outils complets.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Boutiques Actives</p>
                  <p className="text-4xl font-bold text-emerald-900">{stats.totalVendors}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Produits Total</p>
                  <p className="text-4xl font-bold text-blue-900">{stats.totalProducts}</p>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Moyenne Produits</p>
                  <p className="text-4xl font-bold text-purple-900">{stats.avgProductsPerVendor}</p>
                  <p className="text-xs text-purple-500 mt-1">par boutique</p>
                </div>
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-t-lg border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Filter className="w-6 h-6 text-emerald-600" />
              Recherche et Filtres
            </CardTitle>
            <CardDescription className="text-gray-600">
              Trouvez rapidement les boutiques que vous recherchez
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nom de la boutique..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-11 h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-12 border-2 border-gray-200 hover:bg-gray-50"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  Boutiques ({total})
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Toutes les boutiques approuvées de votre plateforme
                </CardDescription>
              </div>
              <div className="text-sm md:w-fit w-[30%] text-gray-600 bg-white px-4 py-2 rounded-lg border">
                Page {page} / {totalPages}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="ml-4 text-gray-600">Chargement des boutiques...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune boutique trouvée</h3>
                <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche.</p>
                <Button onClick={clearFilters} variant="outline" className="border-2">
                  Réinitialiser la recherche
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {rows.map((vendor) => (
                  <Card key={vendor._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-emerald-300 bg-white overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        {/* Logo and Basic Info */}
                        <div className="flex flex-start gap-2 items-center justify-start mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {vendor.businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                              {vendor.businessName}
                            </h3>
                            <p className="text-sm text-gray-600">@{vendor.vendorSlug}</p>
                          </div>
                        </div>

                        {/* Vendor Details */}
                        <div className="flex-1 space-y-3">

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{vendor.productCount || 0} produits</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Créée le {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                            </div>
                          </div>

                          {vendor.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-3">
                              {vendor.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            title="Voir la boutique"
                          >
                            <a href={`/vendor/${vendor.vendorSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Boutique
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} boutiques
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 p-0 ${
                            pageNum === page
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
                              : "border-2 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


