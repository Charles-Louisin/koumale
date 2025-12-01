"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Modal } from "@/app/components/ui/modal";
import { ToastContainer, Toast, ToastType } from "@/app/components/ui/toast";
import { productsApi, categoriesApi, vendorsApi, Vendor } from "@/app/lib/api";
import { Search, Filter, Package, Store, TrendingUp, Eye, MessageCircle, Trash2, ChevronLeft, ChevronRight, Mail, Send } from "lucide-react";
import Image from "next/image";
import { LazyImage } from "@/app/components/ui/lazy-image";

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type ProductRow = {
  _id: string;
  name: string;
  price: number;
  category: string;
  vendorName?: string;
  vendorSlug?: string;
  vendorWhatsappLink?: string;
  vendorTelegramLink?: string;
  vendorEmail?: string;
  createdAt?: string;
  images?: string[];
  views?: number;
  clicks?: number;
};

type ApiProduct = {
  _id: string;
  name: string;
  price: number;
  category: string;
  vendor?: { businessName?: string; vendorSlug?: string };
  createdAt?: string;
  images?: string[];
  views?: number;
  clicks?: number;
};


export default function AdminProductsPage() {
  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedVendorSlug, setSelectedVendorSlug] = React.useState('');
  const [categories, setCategories] = React.useState<string[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    totalViews: 0,
    totalClicks: 0,
    avgPrice: 0
  });
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<ProductRow | null>(null);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [catRes, venRes] = await Promise.all([
        categoriesApi.list(),
        vendorsApi.list({ limit: 100 })
      ]);
      if (catRes.success) setCategories(catRes.data || []);
      if (venRes.success) setVendors(venRes.data || []);
    };
    fetchData();
  }, []);

  const load = React.useCallback((p: number) => {
    setLoading(true);
    productsApi
      .list({
        page: p,
        limit,
        q: q || undefined,
        category: selectedCategory || undefined,
        vendorSlug: selectedVendorSlug || undefined
      })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const products = (res.data as ApiProduct[]).map((pr) => {
            // Find vendor details for contact links
            const vendor = vendors.find(v => v.vendorSlug === pr.vendor?.vendorSlug);
            return {
              _id: pr._id,
              name: pr.name,
              price: pr.price,
              category: pr.category,
              vendorName: pr.vendor?.businessName,
              vendorSlug: pr.vendor?.vendorSlug,
              vendorWhatsappLink: vendor?.whatsappLink,
              vendorTelegramLink: vendor?.telegramLink,
              vendorEmail: vendor?.user?.email,
              createdAt: pr.createdAt,
              images: pr.images,
              views: pr.views,
              clicks: pr.clicks,
            };
          });
          setRows(products);
          setTotal(typeof res.total === "number" ? res.total : 0);

          // Calculate stats
          const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
          const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);
          const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
          setStats({
            totalProducts: res.total || 0,
            totalViews,
            totalClicks,
            avgPrice
          });
        }
      })
      .finally(() => setLoading(false));
  }, [limit, q, selectedCategory, selectedVendorSlug, vendors]);

  React.useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearFilters = () => {
    setQ('');
    setSelectedCategory('');
    setSelectedVendorSlug('');
    setPage(1);
    load(1);
  };

  const handleDelete = (product: ProductRow) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productsApi.remove(productToDelete._id);
      setRows(prev => prev.filter(p => p._id !== productToDelete._id));
      setTotal(prev => Math.max(0, prev - 1));
      addToast('success', 'Produit supprimé avec succès');
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      addToast('error', 'Erreur lors de la suppression du produit');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
            <p className="text-gray-600 mt-1">Surveillez et gérez tous les produits de la plateforme</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clics Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prix Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
                </div>
                <Store className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres et Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nom du produit..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Boutique</Label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
                  value={selectedVendorSlug}
                  onChange={(e) => setSelectedVendorSlug(e.target.value)}
                >
                  <option value="">Toutes les boutiques</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.vendorSlug} value={vendor.vendorSlug}>
                      {vendor.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} className="w-full">
                  Supprimer les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produits ({total})</CardTitle>
              <div className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">Essayez de modifier vos filtres de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {rows.map((product) => (
                  <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <LazyImage
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 mt-1">
                            {product.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {product.vendorName || 'Boutique inconnue'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                            {product.views || 0}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 pt-2">
                          {product.vendorWhatsappLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="WhatsApp"
                            >
                              <a
                                href={`https://wa.me/${product.vendorWhatsappLink.replace(/\D/g, '').replace(/^0+/, '')}?text=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur ce produit : ${product.name}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {product.vendorTelegramLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Telegram"
                            >
                              <a
                                href={`https://t.me/${product.vendorTelegramLink.replace(/^@/, '')}?text=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur ce produit : ${product.name}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {product.vendorEmail && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Email"
                            >
                              <a
                                href={`mailto:${product.vendorEmail}?subject=${encodeURIComponent(`Demande d'information - ${product.name}`)}&body=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur ce produit : ${product.name}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Supprimer le produit"
                          >
                            <Trash2 className="w-4 h-4" />
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
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} produits
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                          className="w-8 h-8 p-0"
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
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer le produit <strong>{productToDelete?.name}</strong> ?
          </p>
          <p className="text-sm text-gray-500">
            Cette action est irréversible et supprimera définitivement le produit de la plateforme.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
