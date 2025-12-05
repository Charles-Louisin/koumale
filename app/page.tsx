"use client";

import React from "react";
import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
  Store,
  ShoppingBag,
  Star,
  Tag,
  Flame,
  TrendingUp
} from "lucide-react";
import ChatClient from "./components/ai/chat-assistant";
import { LazyImage } from "./components/ui/lazy-image";
import { SkeletonLoading } from "./components/ui/skeleton-loading";
import { Card, CardContent } from "./components/ui/card";
import { productsApi, vendorsApi, ProductItem, Vendor, API_BASE_URL } from "./lib/api";
import { motion } from "framer-motion";
import Image from "next/image";
import InteractiveWhySection from "./components/interactive-why-section";
import InteractiveHowItWorksSection from "./components/interactive-how-it-works-section";
import { calculateDiscountPercentage } from "./lib/utils";
import { ReviewListCarousel } from "./components/reviews/ReviewListCarousel";
import { ReviewForm } from "./components/reviews/ReviewForm";

// Helper function to get first image from array or fallback
const getProductImage = (images: string[] | undefined): string => {
  if (images && images.length > 0) {
    return images[0];
  }
  return "https://placehold.co/300x200/000000/FFFFFF/png?text=Produit";
}

export default function Home() {
  const [promotionProducts, setPromotionProducts] = React.useState<ProductItem[]>([]);
  const [trendingProducts, setTrendingProducts] = React.useState<ProductItem[]>([]);
  const [newProducts, setNewProducts] = React.useState<ProductItem[]>([]);
  const [newVendors, setNewVendors] = React.useState<Vendor[]>([]);
  const [popularVendors, setPopularVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [vw, setVw] = React.useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);

  // const [appReviews, setAppReviews] = React.useState<any[]>([]);
  // const [reviewsLoading, setReviewsLoading] = React.useState(false);
  // const [reviewsError, setReviewsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth || 1024);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const promotionRes = await productsApi.list({ limit: 12, page: 1, promotion: "true" });
        if (promotionRes.success && promotionRes.data) {
          const filteredPromotions = promotionRes.data.filter(
            (product) => product.promotionalPrice && product.promotionalPrice > 0
          );
          setPromotionProducts(filteredPromotions);
        }

        const trendingRes = await productsApi.list({ limit: 20, page: 1 });
        if (trendingRes.success && trendingRes.data) {
          const nonPromo = (trendingRes.data || []).filter(
            (product) => !product.promotionalPrice || product.promotionalPrice === 0
          );
          const sorted = nonPromo.sort((a, b) => (b.views || 0) - (a.views || 0));
          setTrendingProducts(sorted.slice(0, 10));
        }

        const newProductsRes = await productsApi.list({ limit: 10, page: 1 });
        if (newProductsRes.success && newProductsRes.data) {
          setNewProducts(newProductsRes.data);
        }

        const newVendorsRes = await vendorsApi.list({ limit: 12, page: 1 });
        if (newVendorsRes.success && newVendorsRes.data) {
          setNewVendors(newVendorsRes.data);
        }

        const popularVendorsRes = await vendorsApi.list({ limit: 12, page: 1, sortBy: "popular" });
        if (popularVendorsRes.success && popularVendorsRes.data) {
          // Filter vendors with averageRating > 2 and at least 1 review
          const eligibleVendors = popularVendorsRes.data
            .filter((vendor) =>
              vendor.averageRating &&
              vendor.averageRating > 2 &&
              vendor.reviewCount &&
              vendor.reviewCount >= 1
            )
            .sort((a, b) => {
              const aRating = a.averageRating || 0;
              const bRating = b.averageRating || 0;
              const aReviews = a.reviewCount || 0;
              const bReviews = b.reviewCount || 0;

              // Priority 1: Vendors with >= 2 reviews
              const aHasMultipleReviews = aReviews >= 2;
              const bHasMultipleReviews = bReviews >= 2;

              if (aHasMultipleReviews && !bHasMultipleReviews) return -1;
              if (!aHasMultipleReviews && bHasMultipleReviews) return 1;

              // Within same priority group, sort by rating descending, then by review count descending
              if (aRating !== bRating) {
                return bRating - aRating;
              }
              return bReviews - aReviews;
            });

          setPopularVendors(eligibleVendors.slice(0, 12));
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    // const fetchAppReviews = async () => {
    //   setReviewsLoading(true);
    //   setReviewsError(null);
    //   try {
    //     // Fetch app reviews, type 'app' to distinguish from product/vendor reviews
    //     const res = await fetch(`${API_BASE_URL}/api/reviews?type=app&page=1&limit=10`).then(r => r.json());
    //     if (res.success && res.data) {
    //       setAppReviews(res.data);
    //     } else {
    //       setReviewsError("Erreur lors du chargement des avis");
    //     }
    //   } catch (err) {
    //     console.error("Error fetching app reviews:", err);
    //     setReviewsError("Erreur lors du chargement des avis");
    //   } finally {
    //     setReviewsLoading(false);
    //   }
    // };

    fetchData();
    // fetchAppReviews();
  }, []);

  // const fetchAppReviewsCallback = () => {
  //   setReviewsLoading(true);
  //   fetch(`${API_BASE_URL}/api/reviews?type=app&page=1&limit=10`)
  //     .then(r => r.json())
  //     .then(res => {
  //       if (res.success && res.data) {
  //         setAppReviews(res.data);
  //         setReviewsError(null);
  //       } else {
  //         setReviewsError("Erreur lors du chargement des avis");
  //       }
  //     })
  //     .catch(() => {
  //       setReviewsError("Erreur lors du chargement des avis");
  //     })
  //     .finally(() => {
  //       setReviewsLoading(false);
  //     });
  // };



  return (
    <main className="min-h-screen bg-white">


      {/* Promotions Flash - Modern Carousel */}
      {promotionProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-white" aria-labelledby="promotions-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 id="promotions-heading" className="text-2xl md:text-4xl font-display font-bold text-gray-800">
                      Promotions Flash
                    </h2>
                    <p className="text-l text-gray-600">Retrouvez toutes les promotions</p>
                  </div>
                </div>
              </div>
              <Link
                href="/products?promotion=true"
                className="inline-flex items-center gap-1 px-3 py-2 text-[15px] md:px-6 md:py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Voir tout
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <SkeletonLoading type="promotions" count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">

                {promotionProducts.length > 0 ? promotionProducts.map((product, index) => {
                  const cardVariants = [
                    // Variant 1: Standard square with rounded corners
                    "rounded-xl",
                    // Variant 2: More rounded corners
                    "rounded-2xl",
                    // Variant 3: Sharp corners
                    "rounded-lg",
                    // Variant 4: Pill shape
                    "rounded-3xl"
                  ];
                  const variantIndex = index % cardVariants.length;
                  const isCompact = index % 3 === 0; // Every 3rd card is compact
                  const hasOverlay = index % 2 === 0; // Alternate overlay styles

                  return (
                    <motion.article
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}>
                        <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-red-400/30 shadow-lg hover:shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer aspect-square ${cardVariants[variantIndex]} ${isCompact ? 'shadow-md' : 'shadow-sm'}`}>
                          <div className="relative bg-gray-50 overflow-hidden w-full h-full">
                            <LazyImage
                              src={getProductImage(product.images)}
                              alt={product.name}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.promotionalPrice && product.promotionalPrice > 0 && (
                              <div className={`absolute top-2 right-2 bg-red-500 text-white px-2 py-1 ${variantIndex === 3 ? 'rounded-full' : 'rounded-lg'} text-xs font-bold shadow-sm z-10`}>
                                -{calculateDiscountPercentage(product.price, product.promotionalPrice)}%
                              </div>
                            )}
                            {hasOverlay && (
                              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                            {!hasOverlay && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                            {/* Overlay content */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              {product.vendor && (
                                <span className="text-xs text-white/90 truncate block mb-1">
                                  {product.vendor.businessName}
                                </span>
                              )}
                              <h3 className="line-clamp-2 mb-1 leading-tight text-sm font-medium">
                                {product.name}
                              </h3>
                              {/* Rating Display */}
                              {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs font-medium text-white/90">
                                    {product.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-white/70">
                                    ({product.reviewCount} avis)
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  {product.promotionalPrice && product.promotionalPrice > 0 ? (
                                    <>
                                      <span className="text-sm font-bold text-white">
                                        {product.promotionalPrice.toFixed(0)} FCFA
                                      </span>
                                      <span className="text-xs text-white/80 line-through">
                                        {product.price.toFixed(0)} FCFA
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-bold text-white">
                                      {product.price.toFixed(0)} FCFA
                                    </span>
                                  )}
                                </div>
                                <div className="bg-white/30 rounded-full flex items-center justify-center w-6 h-6">
                                  <ArrowRight className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.article>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 text-gray-500">Aucun produit en promotion</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}


      {/* Trending Products - Bento Grid Style */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="trending-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 id="trending-heading" className="text-2xl md:text-4xl font-display font-bold text-gray-800">
                      Produits Tendance
                    </h2>
                    <p className="text-sm text-gray-600">Les plus populaires du moment</p>
                  </div>
                </div>
              </div>
              <Link
                href="/products"
                className="flex md:inline-flex items-center gap-1 px-3 py-2 text-[15px] md:gap-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Chargement des produits...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {trendingProducts.length > 0 ? trendingProducts.map((product, index) => {
                  const cardVariants = [
                    // Variant 1: Standard with subtle border
                    "rounded-2xl border-2",
                    // Variant 2: Minimalist with thin border
                    "rounded-xl border",
                    // Variant 3: Sharp with colored accent
                    "rounded-lg border-l-4 border-l-purple-500",
                    // Variant 4: Rounded with shadow
                    "rounded-3xl shadow-lg"
                  ];
                  const variantIndex = index % cardVariants.length;
                  const isMinimal = index % 4 === 0; // Every 4th card is minimal
                  const hasBadge = index % 3 !== 0; // Most cards have badges

                  return (
                    <motion.article
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}>
                        <Card className={`overflow-hidden bg-white border-gray-200 hover:border-purple-400/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer aspect-square ${cardVariants[variantIndex]} ${isMinimal ? 'bg-gradient-to-br from-white to-purple-50/30' : ''}`}>
                          <div className="relative bg-gray-50 overflow-hidden w-full h-full">
                            <LazyImage
                              src={getProductImage(product.images)}
                              alt={product.name}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className={`absolute inset-0 ${variantIndex === 2 ? 'bg-gradient-to-bl from-purple-500/20 via-transparent to-pink-500/20' : 'bg-gradient-to-t from-black/25 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            {/* Permanent black gradient at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            {/* Text content positioned in the black area */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              {product.vendor && (
                                <span className="text-xs text-white/90 font-medium truncate block uppercase tracking-wide mb-2">
                                  {product.vendor.businessName}
                                </span>
                              )}
                              <h3 className="line-clamp-2 mb-2 leading-tight text-base font-semibold">
                                {product.name}
                              </h3>
                              {/* Rating Display */}
                              {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                                <div className="flex items-center gap-1 mb-2">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs font-medium text-white/90">
                                    {product.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-white/70">
                                    ({product.reviewCount} avis)
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">
                                  {product.price.toFixed(0)} FCFA
                                </span>
                                <div className="bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center w-8 h-8 border border-white/20">
                                  <ArrowRight className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.article>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 text-gray-500">Aucun produit tendance</div>
                )}
              </div>
            )}
          </div>
        </section>

      {/* Why Choose KOUMALE - Interactive Learning Experience */}
      <InteractiveWhySection />

      {/* New Products - Horizontal Scroll */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-white" aria-labelledby="new-products-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 id="new-products-heading" className="text-2xl md:text-4xl font-display font-bold text-gray-800">
                      Nouveaux Produits
                    </h2>
                    <p className="text-sm text-gray-600">Découvrez les dernières nouveautés</p>
                  </div>
                </div>
              </div>
              <Link
                href="/products"
                className="flex md:inline-flex items-center gap-1 px-3 py-2 text-[15px] md:gap-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <SkeletonLoading type="products" count={6} />
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4" style={{ minWidth: 'min-content' }}>
                  {newProducts.length > 0 ? newProducts.map((product, index) => (
                    <motion.article
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group shrink-0 w-48"
                    >
                      <Link href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}>
                        <Card className="overflow-hidden bg-white border border-gray-200 hover:border-blue-400/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-2xl">
                          <div className="relative bg-gray-50 overflow-hidden aspect-2/2">
                            <LazyImage
                              src={getProductImage(product.images)}
                              alt={product.name}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              {product.vendor && (
                                <span className="text-xs text-white/90 font-medium truncate block uppercase tracking-wide mb-2">
                                  {product.vendor.businessName}
                                </span>
                              )}
                              <h3 className="line-clamp-2 mb-2 leading-tight text-base font-semibold">
                                {product.name}
                              </h3>
                              {/* Rating Display */}
                              {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                                <div className="flex items-center gap-1 mb-2">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs font-medium text-white/90">
                                    {product.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-white/70">
                                    ({product.reviewCount} avis)
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">
                                  {product.price.toFixed(0)} FCFA
                                </span>
                                <div className="bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center w-8 h-8 border border-white/20">
                                  <ArrowRight className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.article>
                  )) : (
                    <div className="w-full text-center py-12 text-gray-500">Aucun nouveau produit</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

      {/* New Vendors - Modern Cards */}
      {newVendors.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-white" aria-labelledby="new-vendors-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 id="new-vendors-heading" className="text-2xl md:text-4xl font-display font-bold text-gray-800">
                      Nouvelles Boutiques
                    </h2>
                    <p className="text-sm text-gray-600">Découvrez les derniers arrivants</p>
                  </div>
                </div>
              </div>
              <Link
                href="/vendors"
                className="flex md:inline-flex items-center gap-1 px-3 py-2 text-[15px] md:gap-2 md:px-6 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <SkeletonLoading type="vendors" count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {newVendors.length > 0 ? newVendors.map((vendor, index) => {
                  const cardVariants = [
                    // Variant 1: Clean with logo overlay
                    "rounded-2xl",
                    // Variant 2: Minimalist with border accent
                    "rounded-xl border-l-4 border-l-green-500",
                    // Variant 3: Elevated with shadow
                    "rounded-lg shadow-lg",
                    // Variant 4: Rounded with gradient background
                    "rounded-3xl bg-gradient-to-br from-green-50/50 to-emerald-50/30"
                  ];
                  const variantIndex = index % cardVariants.length;
                  const logoPosition = index % 3; // Different logo positions
                  const hasBadge = index % 2 === 0; // Alternate badge presence

                  return (
                    <motion.article
                      key={vendor._id || vendor.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link href={`/vendor/${vendor.vendorSlug}`}>
                        <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-green-400/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer ${cardVariants[variantIndex]}`}>
                          <div className="aspect-[4/3] relative bg-gray-50">
                            <LazyImage
                              src={vendor.coverImage || "https://placehold.co/400x300/000000/FFFFFF/png?text=Boutique"}
                              alt={`Bannière ${vendor.businessName}`}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className={`absolute inset-0 ${variantIndex === 3 ? 'bg-gradient-to-br from-green-500/15 via-transparent to-teal-500/15' : 'bg-gradient-to-t from-black/40 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            {vendor.logo && (
                              <div className={`absolute border-3 border-white overflow-hidden shadow-xl bg-white ${logoPosition === 0 ? '-bottom-6 left-3 w-12 h-12 rounded-xl' : logoPosition === 1 ? '-bottom-5 right-3 w-10 h-10 rounded-full' : 'top-3 left-3 w-14 h-14 rounded-2xl'}`}>
                                <LazyImage
                                  src={vendor.logo}
                                  alt={`Logo ${vendor.businessName}`}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <CardContent className="pt-8 px-3 pb-3">
                            <h3 className={`truncate mb-2 group-hover:text-green-700 transition-colors ${variantIndex === 3 ? 'font-bold text-sm' : 'font-semibold text-sm'}`}>
                              {vendor.businessName}
                            </h3>
                            <p className={`text-gray-600 line-clamp-2 mb-3 leading-tight ${variantIndex === 3 ? 'text-xs' : 'text-xs'}`}>
                              {vendor.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Cliquez pour visiter</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.article>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 text-gray-500">Aucune nouvelle boutique</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}


      {/* Popular Vendors */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="popular-vendors-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>
                  <div>
                    <h2 id="popular-vendors-heading" className="text-2xl md:text-4xl font-display font-bold text-gray-800">
                      Boutiques Populaires
                    </h2>
                    <p className="text-sm text-gray-600">Les mieux notées par nos clients</p>
                  </div>
                </div>
              </div>
              <Link
                href="/vendors"
                className="flex md:inline-flex items-center gap-1 px-3 py-2 text-[15px] md:gap-2 md:px-6 md:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <SkeletonLoading type="vendors" count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {popularVendors.length > 0 ? popularVendors.map((vendor, index) => {
                  const cardVariants = [
                    // Variant 1: Premium with gold accent
                    "rounded-2xl border-2 border-yellow-200/50",
                    // Variant 2: Modern with angled border
                    "rounded-xl border-r-4 border-r-yellow-500",
                    // Variant 3: Classic with shadow and badge
                    "rounded-lg shadow-xl",
                    // Variant 4: Artistic with background pattern
                    "rounded-3xl bg-gradient-to-br from-yellow-50/60 to-amber-50/40"
                  ];
                  // Calculate combined score for each vendor (rating + review count)
                  const vendorScores = popularVendors.map(v => ({
                    vendor: v,
                    score: (v.averageRating || 0) + (v.reviewCount || 0)
                  }));
                  const maxScore = Math.max(...vendorScores.map(v => v.score));
                  const variantIndex = index % cardVariants.length;
                  const logoStyle = index % 4; // Different logo styles
                  const badgeStyle = index % 3; // Different badge styles
                  // Show "Top" badge for vendors with the highest combined score
                  const vendorScore = (vendor.averageRating || 0) + (vendor.reviewCount || 0);
                  const showTopBadge = vendorScore === maxScore;

                  return (
                    <motion.article
                      key={vendor._id || vendor.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link href={`/vendor/${vendor.vendorSlug}`}>
                        <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-yellow-400/50 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${cardVariants[variantIndex]}`}>
                          <div className="aspect-[4/3] relative bg-gray-50">
                            <LazyImage
                              src={vendor.coverImage || "https://placehold.co/400x300/000000/FFFFFF/png?text=Boutique"}
                              alt={`Bannière ${vendor.businessName}`}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className={`absolute inset-0 ${variantIndex === 3 ? 'bg-gradient-to-bl from-yellow-500/20 via-transparent to-orange-500/20' : 'bg-gradient-to-t from-black/45 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            {vendor.logo && (
                              <div className={`absolute border-3 border-white overflow-hidden shadow-2xl bg-white ${logoStyle === 0 ? '-bottom-6 left-3 w-12 h-12 rounded-xl' : logoStyle === 1 ? '-bottom-5 right-3 w-10 h-10 rounded-full' : logoStyle === 2 ? 'top-3 right-3 w-14 h-14 rounded-2xl' : 'bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 border-yellow-400'}`}>
                                <LazyImage
                                  src={vendor.logo}
                                  alt={`Logo ${vendor.businessName}`}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {showTopBadge && (
                              <div className={`absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 ${badgeStyle === 0 ? 'rounded-full' : badgeStyle === 1 ? 'rounded-lg' : 'rounded-md'} text-xs font-bold shadow-sm flex items-center gap-1`}>
                                <Star className="w-3 h-3 fill-white" />
                                Top
                              </div>
                            )}
                          </div>
                          <CardContent className="pt-8 px-3 pb-3">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className={`font-semibold text-sm group-hover:text-yellow-700 transition-colors leading-tight truncate ${variantIndex === 0 ? 'font-bold' : variantIndex === 3 ? 'font-bold' : ''}`}>
                                {vendor.businessName}
                              </h3>
                              {vendor.averageRating && vendor.averageRating > 0 && (
                                <div className="flex items-center gap-1 text-yellow-400 ml-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {vendor.averageRating.toFixed(1)} ({vendor.reviewCount} avis)
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className={`text-gray-600 line-clamp-1 mb-2 leading-tight text-xs ${variantIndex === 3 ? 'text-xs' : 'text-xs'}`}>
                              {vendor.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Cliquez pour visiter</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.article>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 text-gray-500">Aucune boutique populaire</div>
                )}
              </div>
            )}
          </div>
        </section>

      {/* How It Works - Interactive Guide */}
      <InteractiveHowItWorksSection />


      {/* CTA Section - Modern & Engaging */}
      <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Prêt à transformer votre <span className="gradient-text">expérience d&apos;achat</span> ?
            </h2>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Rejoignez la grande famille d&apos;utilisateurs qui fait confiance à KOUMALE pour leurs achats et leurs ventes en ligne
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5" />
                Commencer à acheter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/register-vendor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:-translate-y-1"
              >
                <Store className="w-5 h-5" />
                Devenir vendeur
              </Link>
            </div>


          </motion.div>
        </div>
      </section>

      {/* Chat Assistant */}
      {/* <ChatClient /> */}

    </main>
  )
};