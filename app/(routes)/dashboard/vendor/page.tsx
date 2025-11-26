"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Package, Eye, MousePointer, Share2, Plus, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { vendorApi, authApi, vendorsApi, ProductItem } from "@/app/lib/api";

type TopProduct = { name: string; views: number; clicks: number };

export default function VendorDashboardPage() {
  const [stats, setStats] = React.useState<{ totalProducts: number; totalViews: number; totalClicks: number; topProducts: TopProduct[] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [vendorName, setVendorName] = React.useState<string>("");
  const [vendorSlug, setVendorSlug] = React.useState<string>("");
  const [recentProducts, setRecentProducts] = React.useState<ProductItem[]>([]);
  const [sharing, setSharing] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [statsRes, meRes] = await Promise.all([vendorApi.getMyStats(), authApi.getMe()]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (meRes.success && meRes.user) {
          const v = meRes.user.vendor;
          if (v?.businessName) setVendorName(v.businessName as string);
          if (v?.vendorSlug) {
            setVendorSlug(v.vendorSlug as string);
            try {
              const productsRes = await vendorsApi.getProducts(v.vendorSlug, { limit: 5 });
              if (productsRes.success && Array.isArray(productsRes.data)) {
                setRecentProducts(productsRes.data);
              }
            } catch {
              setRecentProducts([]);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const shopRelativeUrl = vendorSlug ? `/vendor/${vendorSlug}` : "";
  const shopAbsoluteUrl = React.useMemo(() => {
    if (!vendorSlug) return "";
    if (typeof window === "undefined") return shopRelativeUrl;
    return `${window.location.origin}${shopRelativeUrl}`;
  }, [vendorSlug, shopRelativeUrl]);

  const handleShare = async () => {
    if (!shopAbsoluteUrl) return;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: vendorName || "Ma boutique", url: shopAbsoluteUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shopAbsoluteUrl);
      }
    } finally {
      setSharing(false);
    }
  };

  const copyLink = async () => {
    if (!shopAbsoluteUrl) return;
    try {
      await navigator.clipboard.writeText(shopAbsoluteUrl);
    } catch {}
  };

  return (
    loading ? <div /> :
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Tableau de bord</h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                Bienvenue sur votre espace vendeur{vendorName ? `, ${vendorName}` : ''}. Gérez efficacement votre boutique en ligne avec des insights en temps réel.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link href="/dashboard/vendor/products/new" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter un produit</span>
                  <span className="sm:hidden">Ajouter</span>
                </Button>
              </Link>
              {vendorSlug ? (
                <Link href={shopRelativeUrl} target="_blank" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-2 hover:bg-orange-50">
                    <Eye className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Voir ma boutique</span>
                    <span className="sm:hidden">Voir</span>
                  </Button>
                </Link>
              ) : null}
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={!vendorSlug || sharing}
                className="w-full sm:w-auto border-2 hover:bg-orange-50"
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{sharing ? "Partage..." : "Partager ma boutique"}</span>
                <span className="sm:hidden">{sharing ? "..." : "Partager"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Produits</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats?.totalProducts ?? 0}</p>
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
                  <p className="text-sm font-medium text-orange-600 mb-1">Vues</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats?.totalViews ?? 0}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Clics</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{stats?.totalClicks ?? 0}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MousePointer className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Top produit (vues)</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-900">{(stats?.topProducts?.[0]?.views ?? 0)}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8 mb-12">
          {/* Quick Actions */}
          <Card className="xl:col-span-1 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Actions rapides</CardTitle>
              <CardDescription>Accès rapide aux tâches importantes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/dashboard/vendor/products/new">
                <Button className="w-full justify-start h-12 cursor-pointer hover:bg-orange-500 text-white border-0">
                  <Plus className="w-5 h-5 mr-3" />
                  <span className="hidden sm:inline">Ajouter un produit</span>
                  <span className="sm:hidden">Ajouter</span>
                </Button>
              </Link>
              <Link href="/dashboard/vendor/products">
                <Button variant="outline" className="w-full cursor-pointer justify-start h-12 border-2 hover:bg-orange-50">
                  <Package className="w-5 h-5 mr-3" />
                  <span className="hidden sm:inline">Gérer les produits</span>
                  <span className="sm:hidden">Gérer</span>
                </Button>
              </Link>
              {vendorSlug ? (
                <Link href={shopRelativeUrl} target="_blank">
                  <Button variant="outline" className="w-full cursor-pointer justify-start h-12 border-2 hover:bg-orange-50">
                    <Eye className="w-5 h-5 mr-3" />
                    <span className="hidden sm:inline">Voir ma boutique</span>
                    <span className="sm:hidden">Voir</span>
                  </Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card className="xl:col-span-2 border-0 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 text-orange-500 mr-2" />
                  Produits récents
                </CardTitle>
                <CardDescription>
                  Les derniers produits que vous avez ajoutés à votre boutique
                </CardDescription>
              </div>
              <Link href="/dashboard/vendor/products">
                <Button variant="outline" size="sm" className="border-2 w-full sm:w-auto">
                  <span className="hidden sm:inline">Voir tout</span>
                  <span className="sm:hidden">Voir</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.slice(0, 3).map((product) => (
                    <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-600 truncate">{product.category}</p>
                          <p className="text-xs text-gray-500">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href={`/dashboard/vendor/products/${product._id}`} className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 hover:bg-white w-full"
                          >
                            <span className="hidden sm:inline">Modifier</span>
                            <span className="sm:hidden">Modif</span>
                          </Button>
                        </Link>
                        {vendorSlug ? (
                          <Link href={`/vendor/${vendorSlug}/product/${product._id}`} target="_blank" className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="border-2 hover:bg-white w-full">
                              <span className="hidden sm:inline">Voir</span>
                              <span className="sm:hidden">Voir</span>
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {recentProducts.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/vendor/products">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                          Voir {recentProducts.length - 3} autres produits →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Aucun produit</p>
                  <p className="text-gray-600">Commencez par ajouter votre premier produit.</p>
                  <div className="mt-4">
                    <Link href="/dashboard/vendor/products/new">
                      <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Ajouter un produit</span>
                        <span className="sm:hidden">Ajouter</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shop Link */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Share2 className="w-6 h-6 text-orange-500 mr-2" />
              Lien de votre boutique
            </CardTitle>
            <CardDescription>
              Partagez ce lien pour promouvoir votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={shopAbsoluteUrl || ""}
                readOnly
                className="flex-1"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={copyLink} disabled={!vendorSlug} className="border-2 hover:bg-orange-50 flex-1 sm:flex-none">
                  <span className="hidden sm:inline">Copier</span>
                  <span className="sm:hidden">Copier</span>
                </Button>
                {vendorSlug ? (
                  <Link href={shopRelativeUrl} target="_blank" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="border-2 hover:bg-orange-50 w-full">
                      <span className="hidden sm:inline">Ouvrir</span>
                      <span className="sm:hidden">Ouvrir</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
