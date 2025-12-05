"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { vendorsApi, productsApi, Vendor, ProductItem } from "@/app/lib/api";
import { LazyImage } from "@/app/components/ui/lazy-image";
import { motion } from "framer-motion";
import { Store, MapPin, Phone, MessageCircle, Star, Package, ArrowRight, Users, Award, Clock, Shield, Filter, Send, Mail } from "lucide-react";
import Image from "next/image";

// Helper function to get first image from array or fallback
const getProductImage = (images: string[] | undefined): string => {
  if (images && images.length > 0) {
    return images[0];
  }
  return "https://placehold.co/300x200/000000/FFFFFF/png?text=Produit";
};

export default function VendorPage({ params }: { params: Promise<{ vendorSlug: string }> }) {
  const { vendorSlug } = use(params);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vendor details
        const vendorRes = await vendorsApi.getBySlug(vendorSlug);
        if (vendorRes.success && vendorRes.data) {
          setVendor(vendorRes.data);
        } else {
          setError("Boutique non trouvée");
        }

        // Fetch vendor products
        const productsRes = await vendorsApi.getProducts(vendorSlug, { limit: 100 });
        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);

          // Calculate vendor rating from products
          if (vendorRes.success && vendorRes.data) {
            const productsWithRating = productsRes.data.filter(p => p.averageRating != null && p.reviewCount != null && p.reviewCount > 0);
            if (productsWithRating.length > 0) {
              const totalRating = productsWithRating.reduce((sum, p) => sum + p.averageRating!, 0);
              const totalReviews = productsWithRating.reduce((sum, p) => sum + p.reviewCount!, 0);
              const averageRating = totalRating / productsWithRating.length;
              setVendor({ ...vendorRes.data, averageRating, reviewCount: totalReviews });
            } else {
              setVendor(vendorRes.data);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorSlug]);

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["Toutes", ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Chargement de la boutique...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !vendor) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto py-16 px-4">
          <div className="text-center py-16 bg-red-50 rounded-3xl p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600">{error || "Boutique non trouvée"}</p>
            <Link href="/vendors" className="inline-block mt-4">
              <Button variant="outline">Retour aux boutiques</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative "
      >
        {/* Cover Image */}    
        <div className="relative h-80 md:h-80 ">
          <LazyImage
            src={vendor.coverImage || "https://placehold.co/1200x300/000000/FFFFFF/png?text=Boutique"}
            alt={`Bannière ${vendor.businessName}`}
            fill
            priority={true}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>    
        {/* Vendor Info Overlay */}
        <div className="w-fit px-4 -mt-32 relative z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8"
          >
            <div className="flex flex-col lg:flex-row gap-2 md:gap-8">
              {/* Logo and Name/Products Count */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="shrink-0 flex justify-center items-center gap-10 lg:items-center"
              >
                {vendor.logo && (
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white relative shadow-2xl bg-white mb-4">
                    <LazyImage
                      src={vendor.logo}
                      alt={`Logo ${vendor.businessName}`}
                      fill
                      priority={true}
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className=" flex flex-col gap-2 justify-center items-center text-left lg:text-left">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-800 mb-1"
                  >
                    {vendor.businessName}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="flex items-center justify-center lg:justify-start gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full flex items-center justify-center">
                        <Package className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{products.length} produits</span>
                    </div>
                    {vendor.averageRating != null && vendor.reviewCount != null && vendor.reviewCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {vendor.averageRating.toFixed(1)} ({vendor.reviewCount} avis)
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
              {/* Vendor Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-lg text-center md:text-start text-gray-600 max-w-2xl"
                  >
                    {vendor.description}
                  </motion.p>
                </div>



                {/* Contact Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6"
                >
                  {vendor.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{vendor.address}</span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    {vendor.contactPhone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Link href={`tel:${vendor.contactPhone.replace(/\s+/g, '')}`} className="text-primary">
                              <Phone className="w-5 h-5 text-gray-700" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {vendor.whatsappLink && (() => {
                      const cleanNumber = vendor.whatsappLink.replace(/\D/g, '').replace(/^0+/, '');
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center">
                              <Link href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur vos produits disponibles sur ${vendor.businessName}.`)}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                <Image
                                  src={"https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"}
                                  alt={"WhatsApp"}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain"
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {vendor.telegramLink && (() => {
                      const cleanUsername = vendor.telegramLink.replace(/^@/, '');
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              <Link href={`https://t.me/${cleanUsername}?text=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur vos produits disponibles sur ${vendor.businessName}.`)}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                <Image
                                  src={"https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"}
                                  alt={"Telegram"}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain"
                                />                            </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {vendor.user?.email && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Link href={`mailto:${vendor.user.email}?subject=${encodeURIComponent(`Demande d'information - ${vendor.businessName}`)}&body=${encodeURIComponent(`Bonjour ! Je voudrais en savoir plus sur vos produits disponibles sur ${vendor.businessName}.`)}`} className="text-primary">
                              <Mail className="w-5 h-5 text-gray-700" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Category Tabs */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex justify-center">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-800">Filtrer par catégorie</span>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {categories.map((category, index) => (
                      <motion.button
                        key={category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedCategory(category === "Toutes" ? "all" : category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${selectedCategory === (category === "Toutes" ? "all" : category)
                          ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
              
                const cardVariants = [
                  "rounded-2xl",
                  "rounded-xl border-l-4 border-l-orange-500",
                  "rounded-lg shadow-lg",
                  "rounded-3xl bg-gradient-to-br from-white to-orange-50/30"
                ];
                const variantIndex = index % cardVariants.length;
                const hasBadge = index % 3 === 0;

                return (
                  <motion.article
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link href={`/vendor/${vendorSlug}/product/${product._id}`}>
                      <Card className={`overflow-hidden bg-white border border-gray-200 hover:border-orange-400/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer aspect-square ${cardVariants[variantIndex]}`}>
                        <div className="relative bg-gray-50 overflow-hidden w-full h-full">
                          <LazyImage
                            src={getProductImage(product.images)}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {hasBadge && (
                            <div className={`absolute top-2 right-2 bg-orange-500 text-white px-1.5 py-0.5 ${variantIndex === 1 ? 'rounded-full' : 'rounded-lg'} text-xs font-bold shadow-sm z-10`}>
                              Nouveau
                            </div>
                          )}
                          <div className={`absolute inset-0 ${variantIndex === 2 ? 'bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/10' : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          {/* Permanent black gradient at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                          {/* Text content positioned in the black area */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="mb-2">
                              <span className="text-xs text-white/90 font-medium truncate block uppercase tracking-wide">
                                {product.category}
                              </span>
                            </div>
                            <h3 className="line-clamp-2 mb-2 leading-tight text-base font-semibold">
                              {product.name}
                            </h3>

                            {/* Rating Display */}
                            {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs font-medium text-white/90">
                                  {(product.averageRating || 0).toFixed(1)}
                                </span>
                                <span className="text-xs text-white/70">
                                  ({product.reviewCount} avis)
                                </span>
                              </div>
                            )}


                            <p className="text-white/90 line-clamp-2 mb-3 leading-tight text-sm">
                              {product.description}
                            </p>
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
              }
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full text-center py-16 bg-white rounded-3xl shadow-lg"
              >
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">Cette boutique ne contient pas encore de produits.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
