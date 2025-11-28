"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LazyImage } from "@/app/components/ui/lazy-image";
import { vendorsApi, Vendor } from "@/app/lib/api";
import { motion } from "framer-motion";
import { Store, ArrowRight, Sparkles, Star, Users, MapPin, Award } from "lucide-react";
import VendorFilters from "@/app/components/VendorFilters";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    q?: string;
    address?: string;
    minRating?: number;
    sortBy?: 'popular' | 'newest';
  }>({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await vendorsApi.list({
          page: currentPage,
          limit: 12,
          ...filters,
        });

        if (response.success && response.data) {
          setVendors(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setError("Impossible de charger les boutiques");
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [currentPage, filters]);

  return (
    <main className="min-h-screen bg-white pt-10">
      

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {/* Vendor Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <VendorFilters
            onFiltersChange={setFilters}
            initialFilters={filters}
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Chargement des boutiques...</p>
          </motion.div>
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

        {/* Vendors Grid */}
        {!loading && !error && (
          <>
            {vendors.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              >
                {vendors.map((vendor, index) => {
                  const cardVariants = [
                    "rounded-2xl",
                    "rounded-xl border-l-4 border-l-orange-500",
                    "rounded-lg shadow-lg",
                    "rounded-3xl bg-gradient-to-br from-white to-orange-50/30"
                  ];
                  const variantIndex = index % cardVariants.length;
                  const logoPosition = index % 3;
                  const hasBadge = vendor.createdAt && (new Date().getTime() - new Date(vendor.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000; // New badge for shops created within the last week

                  return (
                    <motion.article
                      key={vendor._id || vendor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link href={`/vendor/${vendor.vendorSlug}`}>
                        <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-orange-400/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${cardVariants[variantIndex]}`}>
                          <div className="aspect-square relative bg-gray-50">
                            <LazyImage
                              src={vendor.coverImage || "https://placehold.co/400x300/000000/FFFFFF/png?text=Boutique"}
                              alt={`Bannière ${vendor.businessName}`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className={`absolute inset-0 ${variantIndex === 3 ? 'bg-gradient-to-br from-orange-500/15 via-transparent to-orange-500/15' : 'bg-gradient-to-t from-black/40 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            {vendor.logo && (
                              <div className={`absolute border-3 border-white overflow-hidden shadow-xl bg-white ${logoPosition === 0 ? '-bottom-2 left-2 w-12 h-12 rounded-lg' : logoPosition === 1 ? '-bottom-5 right-2 w-11 h-11 rounded-full' : 'top-2 left-2 w-14 h-14 rounded-xl'}`}>
                                <LazyImage
                                  src={vendor.logo}
                                  alt={`Logo ${vendor.businessName}`}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {hasBadge && (
                              <div className={`absolute top-2 right-2 bg-orange-500 text-white px-1.5 py-0.5 ${variantIndex === 1 ? 'rounded-full' : 'rounded-lg'} text-xs font-bold shadow-sm flex items-center gap-1`}>
                                <Sparkles className="w-2.5 h-2.5" />
                                New
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className={`font-semibold text-sm group-hover:text-green-700 transition-colors leading-tight truncate ${variantIndex === 3 ? 'text-sm' : 'text-sm'}`}>
                                {vendor.businessName}
                              </h3>
                              {vendor.averageRating && vendor.averageRating > 0 && (
                                <div className="flex items-center gap-1 text-yellow-400 ml-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {vendor.averageRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className={`text-gray-600 line-clamp-1 mb-2 leading-tight text-xs ${variantIndex === 3 ? 'text-xs' : 'text-xs'}`}>
                              {vendor.description}
                            </p>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{vendor.address || "Cameroun"}</span>
                            </div>
                              <div className="bg-orange-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors w-5 h-5">
                                <ArrowRight className="w-2.5 h-2.5 text-orange-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune boutique trouvée</h3>
                <p className="text-gray-600">Revenez plus tard pour découvrir de nouvelles boutiques.</p>
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
                      className="rounded-xl hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                    >
                      Précédent
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="sm"
                        className={`rounded-xl transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
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
                      className="rounded-xl hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
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
