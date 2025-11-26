"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LazyImage } from "@/app/components/ui/lazy-image";
import { authApi, vendorsApi, productsApi, ProductItem } from "@/app/lib/api";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/ui/toast";
import { Modal } from "@/app/components/ui/modal";
import { calculateDiscountPercentage } from "@/app/lib/utils";
import { Edit, Trash2, Plus, Eye, TrendingUp, Package, DollarSign } from "lucide-react";

const getProductImage = (images?: string[]): string => images?.[0] || "https://placehold.co/300x200/000000/FFFFFF/png?text=Produit";

export default function VendorProductsPage() {
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toasts, success, error: toastError, removeToast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const me = await authApi.getMe();
        const slug = (me.user as any)?.vendor?.vendorSlug as string | undefined;
        if (!slug) {
          setError("Profil vendeur introuvable");
          return;
        }
        const res = await vendorsApi.getProducts(slug, { limit: 50 });
        if (res.success && res.data) setProducts(res.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement de vos produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes produits</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre catalogue de produits ({products.length} produit{products.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Link href="/dashboard/vendor/products/new">
          <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total produits</p>
                <p className="text-2xl font-bold text-blue-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">En promotion</p>
                <p className="text-2xl font-bold text-green-900">
                  {products.filter(p => p.promotionalPrice).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Vues totales</p>
                <p className="text-2xl font-bold text-purple-900">
                  {products.reduce((sum, p) => sum + (p.views || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit</h3>
            <p className="text-gray-600 mb-6">
              Commencez à vendre en ajoutant votre premier produit à votre catalogue.
            </p>
            <Link href="/dashboard/vendor/products/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier produit
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product, index) => {
            const discountPercentage = product.promotionalPrice
              ? calculateDiscountPercentage(product.price, product.promotionalPrice)
              : 0;

            return (
              <Card
                key={product._id}
                className="group overflow-hidden border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <LazyImage
                    src={getProductImage(product.images)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Promotion Badge */}
                  {product.promotionalPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Status Badge - Temporarily removed since isActive not in ProductItem type */}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Product Info */}
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Title and Category */}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.promotionalPrice ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-red-600">
                                {product.promotionalPrice.toFixed(0)} FCFA
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                Promo
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 line-through">
                              {product.price.toFixed(0)} FCFA
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {product.price.toFixed(0)} FCFA
                          </span>
                        )}
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{product.views || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{product.clicks || 0} clics</span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/vendor/products/${product._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 hover:bg-primary hover:text-white transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                          onClick={() => setDeleteId(product._id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Toaster officiel */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modal suppression */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer le produit">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-red-900">Attention</h4>
              <p className="text-sm text-red-700">Cette action est irréversible</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir supprimer ce produit ? Toutes les données associées seront perdues.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Annuler
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              if (!deleteId) return;
              try {
                const res = await productsApi.remove(deleteId);
                if (res.success) {
                  setProducts((prev) => prev.filter((p) => p._id !== deleteId));
                  success('Produit supprimé avec succès');
                  setDeleteId(null);
                }
              } catch (e) {
                toastError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
              }
            }}
          >
            Supprimer définitivement
          </Button>
        </div>
      </Modal>
    </div>
  );
}
