"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LazyImage } from "@/app/components/ui/lazy-image";
import { SkeletonLoading } from "@/app/components/ui/skeleton-loading";
import { productsApi, ProductItem, API_BASE_URL } from "@/app/lib/api";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, ArrowRight, Filter, Grid, List, Search, Tag, TrendingUp, Star } from "lucide-react";
import ProductFilters from "@/app/components/ProductFilters";

// Helper function to get first image from array or fallback
const getProductImage = (images: string[] | undefined): string => {
  if (images && images.length > 0) {
    return images[0];
  }
  return "https://placehold.co/300x200/000000/FFFFFF/png?text=Produit";
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = React.useState(0);

  // Advanced filters state
  const [filters, setFilters] = useState<{
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    address?: string;
    minRating?: number;
    isNew?: string;
    isOnPromotion?: boolean;
  }>({});

  // Fetch categories that have products from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // First fetch products to get categories that have products
        const productsResponse = await fetch(`${API_BASE_URL}/api/products?limit=1000`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success && Array.isArray(productsData.data)) {
            // Extract unique categories from products
            const uniqueCategories = [...new Set(productsData.data.map((product: any) => product.category).filter(Boolean))] as string[];
            const sortedCategories = uniqueCategories.sort((a: string, b: string) => a.localeCompare(b));
            setCategories(["Toutes", ...sortedCategories]);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // No fallback categories - page will show empty if backend fails
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  React.useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const selectedCategoryFromUrl = React.useMemo(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.length > 0) {
      const matchingCategory = categories.find(cat => cat !== "Toutes" && cat.toLowerCase().replace(/\s+/g, '-') === categoryParam);
      return matchingCategory || "Toutes";
    }
    return "Toutes";
  }, [categories, searchParams]);

  React.useEffect(() => {
    setSelectedCategory(selectedCategoryFromUrl);
  }, [selectedCategoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const category = selectedCategory === "Toutes" ? undefined : selectedCategory;
        const response = await productsApi.list({
          page: currentPage,
          limit: 12,
          category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          q: filters.q,
          address: filters.address,
          minRating: filters.minRating,
          promotion: filters.isOnPromotion ? 'true' : undefined,
        });

        if (response.success && response.data) {
          setProducts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setError("Impossible de charger les produits");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage, filters]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <main className="min-h-screen pt-12 bg-white">
      

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {/* Modern Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          {/* Advanced Filters */}
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mt-6">
            {/* Categories */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">Catégories</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${selectedCategory === category
                        ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Vue:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${viewMode === "grid"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${viewMode === "list"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <SkeletonLoading type="products" count={12} />
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-red-50 rounded-3xl p-8"
          >
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Products Grid/List */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                    : "space-y-4"
                }
              >
                {products.map((product, index) => {
                  const cardVariants = [
                    "rounded-2xl",
                    "rounded-xl border-l-4 border-l-primary",
                    "rounded-lg shadow-lg",
                    "rounded-3xl bg-gradient-to-br from-white to-gray-50/50"
                  ];
                  const variantIndex = index % cardVariants.length;
                  const isCompact = true; // Always compact for smaller cards
                  const hasBadge = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000; // New badge for products created within the last week

                  return (
                    <motion.article
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      {viewMode === "grid" ? (
                        <Link href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}>
                          <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${cardVariants[variantIndex]}`}>
                            <div className="relative bg-gray-50 overflow-hidden w-full aspect-square">
                              <LazyImage
                                src={getProductImage(product.images)}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {hasBadge && (
                                <div className={`absolute top-2 right-2 bg-primary text-white px-1.5 py-0.5 ${variantIndex === 3 ? 'rounded-full' : 'rounded-lg'} text-xs font-bold shadow-sm flex items-center gap-1 z-10`}>
                                  <Tag className="w-2.5 h-2.5" />
                                  New
                                </div>
                              )}
                              <div className={`absolute inset-0 ${variantIndex === 2 ? 'bg-gradient-to-br from-primary/10 via-transparent to-orange-500/10' : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            </div>
                            <CardContent className="bg-white shadow-2xl p-3">
                              {product.vendor && (
                                <span className="text-xs text-gray-500 font-medium truncate block uppercase tracking-wide mb-1">
                                  {product.vendor.businessName}
                                </span>
                              )}
                              <h3 className="line-clamp-1 sm:line-clamp-2 mb-1 leading-tight text-xs sm:text-sm font-semibold text-gray-800">
                                {product.name}
                              </h3>
                              {/* Rating Display */}
                              {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {product.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({product.reviewCount} avis)
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  {product.promotionalPrice ? (
                                    <>
                                      <span className="text-xs sm:text-sm font-bold text-red-600">
                                        {product.promotionalPrice.toFixed(0)} FCFA
                                      </span>
                                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                                        {product.price.toFixed(0)} FCFA
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm sm:text-base font-bold text-gray-900">
                                      {product.price.toFixed(0)} FCFA
                                    </span>
                                  )}
                                </div>
                                <div className="bg-primary/10 rounded-full flex items-center justify-center w-6 h-6">
                                  <ArrowRight className="w-3 h-3 text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ) : (
                        <Link href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}>
                          <Card className="overflow-hidden border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl">
                            <div className="flex">
                              <div className="w-24 h-24 relative bg-gray-50 shrink-0">
                                <LazyImage
                                  src={getProductImage(product.images)}
                                  alt={product.name}
                                  fill
                                  sizes="96px"
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {hasBadge && (
                                  <div className={`absolute top-1 right-1 bg-primary text-white px-1 py-0.5 ${variantIndex === 3 ? 'rounded-full' : 'rounded'} text-xs font-bold shadow-sm flex items-center gap-1 z-10`}>
                                    <Tag className="w-2 h-2" />
                                    New
                                  </div>
                                )}
                              </div>
                              <CardContent className="flex-1 p-3 items-center">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors mb-0.5">
                                      {product.name}
                                    </h3>
                                    {product.vendor && (
                                      <span className="text-xs text-gray-500 truncate block">
                                        {product.vendor.businessName}
                                      </span>
                                    )}
                                    {/* Rating Display */}
                                    {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                                      <div className="flex items-center gap-1 mb-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-xs font-medium text-gray-700">
                                          {product.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          ({product.reviewCount} avis)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end ml-2">
                                    {product.promotionalPrice ? (
                                      <>
                                        <span className="font-bold text-sm text-red-600">
                                          {product.promotionalPrice.toFixed(0)} FCFA
                                        </span>
                                        <span className="text-xs text-gray-500 line-through">
                                          {product.price.toFixed(0)} FCFA
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-bold text-sm text-gray-900">
                                        {product.price.toFixed(0)} FCFA
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                    {product.description}
                                  </p>
                                  <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white rounded-3xl shadow-lg"
              >
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">Essayez de changer de catégorie ou revenez plus tard.</p>
              </motion.div>
            )}

            {/* Modern Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-12 flex justify-center"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                      Précédent
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="sm"
                        className={`rounded-xl transition-all ${currentPage === pageNum
                            ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg"
                            : "hover:bg-gray-100"
                          }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
