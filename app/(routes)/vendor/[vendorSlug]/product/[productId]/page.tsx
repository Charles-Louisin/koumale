"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ProductItem, Vendor, productsApi, vendorsApi } from "@/app/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Star, Package, Truck, Shield, Award, MessageCircle, Phone, MapPin, ArrowRight, ShoppingBag, Send, Mail } from "lucide-react";
import { ReviewListCarousel } from "@/app/components/reviews/ReviewListCarousel";
import { ReviewForm } from "@/app/components/reviews/ReviewForm";
import { ImageModal } from "@/app/components/ui/image-modal";
import { API_BASE_URL } from "@/app/lib/api";
import { authApi } from "@/app/lib/api";

type LoadedProduct = ProductItem & { attributes?: Record<string, unknown> };

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=Image+indisponible";
const FALLBACK_THUMB = "https://placehold.co/120x120?text=Image";

export default function ProductPage({
  params
}: {
  params: Promise<{ vendorSlug: string; productId: string }>;
}) {
  type ReviewType = {
    _id: string;
    user: {
      firstName?: string;
      lastName?: string;
    };
    rating: number;
    comment: string;
  };

  const { vendorSlug, productId } = use(params);
  const [product, setProduct] = useState<LoadedProduct | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductItem[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current authenticated user info
  const [currentUser, setCurrentUser] = React.useState<{ firstName?: string; lastName?: string } | null>(null);

  const [reviews, setReviews] = useState<ReviewType[]>([]);

  // Image modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  // Calculate average rating from reviews
  const calculatedAverageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const productRes = await productsApi.getById(productId);

        if (!productRes.success || !productRes.data) {
          if (!cancelled) {
            setProduct(null);
            setActiveImage(null);
            setError("Produit introuvable");
          }
          return;
        }

        const productData = productRes.data as LoadedProduct;

        if (cancelled) {
          return;
        }

        setProduct(productData);
        setActiveImage(productData.images?.[0] ?? null);

        // Charger les informations du vendeur
        try {
          const vendorRes = await vendorsApi.getBySlug(vendorSlug);
          if (!cancelled && vendorRes.success && vendorRes.data) {
            setVendor(vendorRes.data);
          }
        } catch {
          // Ignorer les erreurs côté vendeur pour ne pas bloquer la page
        }

        // Produits similaires (même catégorie + promotions si applicable)
        try {
          const similarProductsPromises = [];

          // Produits de la même catégorie
          if (productData.category) {
            similarProductsPromises.push(
              productsApi.list({
                category: productData.category,
                limit: 8
              })
            );
          }

          // Si le produit est en promotion, ajouter d'autres produits en promotion
          if (productData.promotionalPrice && productData.promotionalPrice > 0) {
            similarProductsPromises.push(
              productsApi.list({
                promotion: "true",
                limit: 8
              })
            );
          }

          const results = await Promise.all(similarProductsPromises);

          let allSimilarProducts: ProductItem[] = [];

          results.forEach(result => {
            if (result.success && Array.isArray(result.data)) {
              allSimilarProducts = allSimilarProducts.concat(result.data);
            }
          });

          // Supprimer les doublons et exclure le produit actuel
          const uniqueProducts = allSimilarProducts
            .filter((item, index, self) =>
              index === self.findIndex(p => p._id === item._id) &&
              item._id !== productData._id
            )
            .slice(0, 8);

          if (!cancelled) {
            setSimilarProducts(uniqueProducts);
          }
        } catch {
          if (!cancelled) {
            setSimilarProducts([]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de récupérer le produit");
          setProduct(null);
          setActiveImage(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await productsApi.getReviews(productId, { limit: 10 });
        if (!cancelled && res.success) {
          setReviews(res.data);
        }
      } catch {
        if (!cancelled) setReviews([]);
      }
    };



    // ...

    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.getMe();
        if (!cancelled && res.success && res.data?.user) {
          setCurrentUser({ firstName: res.data.user.firstName, lastName: res.data.user.lastName });
        } else {
          setCurrentUser(null);
        }
      } catch {
        if (!cancelled) setCurrentUser(null);
      }
    };

    fetchData();
    fetchReviews();
    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [productId, vendorSlug]);

  const handleReviewSubmitted = (newReview: any) => {
    // Reload the page to reflect updated reviews immediately
    window.location.reload();
  };

  const attributeEntries = useMemo(() => {
    if (!product?.attributes || typeof product.attributes !== "object") {
      return [];
    }

    // Function to translate attribute keys to French
    const translateKey = (key: string): string => {
      const translations: Record<string, string> = {
        'brand': 'Marque :',
        'model': 'Modèle :'
      };
      return translations[key.toLowerCase()] || key;
    };

    return Object.entries(product.attributes)
      .filter(([, value]) =>
        value !== null &&
        value !== undefined &&
        String(value).trim().length > 0
      )
      .map(([key, value]) => [translateKey(key), value] as [string, unknown]);
  }, [product]);

  const formattedPrice = useMemo(() => {
    if (!product?.price && product?.price !== 0) {
      return null;
    }

    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF"
      }).format(product.price);
    } catch {
      return `${product?.price ?? ""} FCFA`;
    }
  }, [product]);

  const mainImage = activeImage ?? product?.images?.[0] ?? FALLBACK_IMAGE;

  // Modal handlers
  const openModal = (imageIndex: number = 0) => {
    setModalCurrentIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    if (product?.images) {
      setModalCurrentIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const goToPreviousImage = () => {
    if (product?.images) {
      setModalCurrentIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Generate message for contact
  const generateMessage = React.useMemo(() => {
    if (!product) return "Bonjour, je suis intéressé par vos produits.";

    // Determine price to display (promotional if available)
    const displayPrice = product.promotionalPrice && product.promotionalPrice > 0
      ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF"
      }).format(product.promotionalPrice)
      : formattedPrice;

    const productInfo = {
      name: product.name,
      price: displayPrice,
      description: product.description,
      attributes: attributeEntries.map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join(", "),
      link: `${window.location.origin}/vendor/${vendorSlug}/product/${productId}`
    };

    return `Bonjour ! Je suis intéressé par ce produit :\n\n📦 **${productInfo.name}**\n💰 Prix: ${productInfo.price}\n📝 Description: ${productInfo.description}\n🔍 Caractéristiques: ${productInfo.attributes}\n🔗 Lien du produit: ${productInfo.link}\n\nPouvez-vous me donner plus d'informations afin de commander ?`;
  }, [product, formattedPrice, attributeEntries, vendorSlug, productId]);

  // Contact options
  const contactOptions = React.useMemo(() => {
    const options = [];

    // WhatsApp - use vendor's WhatsApp if available, cleaned and full URL
    if (vendor?.whatsappLink) {
      const cleanNumber = vendor.whatsappLink.replace(/\D/g, '').replace(/^0+/, '');
      options.push({
        name: 'WhatsApp',
        href: `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generateMessage)}`,
        icon: MessageCircle,
        description: 'Réponse rapide',
        color: 'bg-green-500 hover:bg-green-600',
        textColor: 'text-white'
      });
    }

    // Email - use vendor's email from user data if available
    if (vendor?.user?.email) {
      options.push({
        name: 'Email',
        href: `mailto:${vendor.user.email}?subject=${encodeURIComponent(`Demande d'information - ${product?.name || 'Produit'}`)}&body=${encodeURIComponent(generateMessage)}`,
        icon: Mail,
        description: 'Réponse sous 24h',
        color: 'bg-blue-500 hover:bg-blue-600',
        textColor: 'text-white'
      });
    }

    // Telegram - use vendor's Telegram if available, cleaned and full URL
    if (vendor?.telegramLink) {
      const cleanUsername = vendor.telegramLink.replace(/^@/, '');
      options.push({
        name: 'Telegram',
        href: `https://t.me/${cleanUsername}?text=${encodeURIComponent(generateMessage)}`,
        icon: Send,
        description: 'Message direct',
        color: 'bg-blue-400 hover:bg-blue-500',
        textColor: 'text-white'
      });
    }

    return options;
  }, [generateMessage, product?.name, vendor]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Chargement du produit…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto py-16 px-4">
          <div className="text-center py-16 bg-red-50 rounded-3xl p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600">{error ?? "Produit introuvable"}</p>
            <Link href={`/vendor/${vendorSlug}`} className="inline-block mt-4">
              <Button variant="outline">Retour à la boutique</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Breadcrumb */}
      <section className="py-8 px-4 md:px-6 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/vendors" className="hover:text-primary transition-colors">Boutiques</Link>
            <span>/</span>
            <Link href={`/vendor/${vendorSlug}`} className="hover:text-primary transition-colors">
              {vendor?.businessName ?? product.vendor?.businessName ?? "Boutique"}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate">{product.name}</span>
          </motion.nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-4/3 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden cursor-pointer" onClick={() => openModal(product?.images?.indexOf(activeImage || product?.images?.[0] || '') || 0)}>
              <div
                className="h-full w-full bg-cover bg-center transition-all duration-500 hover:scale-105 brightness-110"
                style={{ backgroundImage: `url(${mainImage})` }}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${activeImage === image ? "border-primary shadow-lg" : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => {
                      setActiveImage(image);
                    }}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Vendor Info */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
              <Link
                href={`/vendor/${vendorSlug}`}
                className="font-semibold flex items-center justify-center gap-3 text-gray-800 hover:text-primary transition-colors"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${vendor?.logo ?? FALLBACK_THUMB})` }}>
                  </div>

                  <div className="flex">
                    {vendor?.businessName ?? product.vendor?.businessName ?? "Boutique"}
                  </div>
                </div>
              </Link>
            </div>

            {/* Product Title & Price */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4"
              >
                {product.name}
              </motion.h1>

              {/* Rating Display */}
              {reviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold text-gray-800">
                      {calculatedAverageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({reviews.length} avis)
                  </span>
                </motion.div>
              )}


              {product.promotionalPrice ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-500 line-through">
                      {formattedPrice}
                    </span>
                    <span className="text-4xl font-bold text-red-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "XOF"
                      }).format(product.promotionalPrice)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      -{Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}% de réduction
                    </span>
                  </div>
                </motion.div>
              ) : (
                formattedPrice && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-4xl font-bold text-primary mb-6"
                  >
                    {formattedPrice}
                  </motion.div>
                )
              )}
            </div>

            {/* Product Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            {/* Product Attributes */}
            {attributeEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Caractéristiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributeEntries.map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
            >
              {[

                { icon: Shield, label: "Paiement Sécurisé", color: "text-green-600" },
                { icon: Truck, label: "Livraison Rapide", color: "text-blue-600" },
                { icon: Award, label: "Garantie Qualité", color: "text-purple-600" }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="text-xs font-medium text-gray-700">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacter le vendeur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {contactOptions.map((option, index) => (
                  <motion.a
                    key={option.name}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${option.color} ${option.textColor} transition-all hover:scale-105 shadow-sm`}
                  >
                    <option.icon className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-xs opacity-90">{option.description}</div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {vendor?.contactPhone && (
                <motion.a
                  href={`tel:${vendor.contactPhone}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white transition-all hover:scale-105 shadow-sm block"
                >
                  <Phone className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Appeler</div>
                    <div className="text-xs opacity-90">Contact direct</div>
                  </div>
                </motion.a>
              )}
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Stock disponible</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Avis des utilisateurs</h2>

          {/* Review List Carousel */}
          <ReviewListCarousel reviews={reviews} />

          {/* Review Form */}
          <div className="mt-8 flex items-center justify-center">
            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
          </div>
        </section>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                Produits <span className="gradient-text">similaires</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {similarProducts.map((item, index) => {
                const image = item.images?.[0] ?? FALLBACK_THUMB;
                const displayPrice = item.promotionalPrice && item.promotionalPrice > 0 ? item.promotionalPrice : item.price;
                const originalPrice = item.promotionalPrice && item.promotionalPrice > 0 ? item.price : null;
                const priceLabel = (() => {
                  try {
                    return new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF"
                    }).format(displayPrice);
                  } catch {
                    return `${displayPrice} FCFA`;
                  }
                })();

                return (
                  <motion.article
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link href={`/vendor/${vendorSlug}/product/${item._id}`}>
                      <Card className="overflow-hidden bg-white border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl">
                        <div className="aspect-square relative bg-gray-50 overflow-hidden">
                          <div
                            className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                            style={{ backgroundImage: `url(${image})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {item.promotionalPrice && item.promotionalPrice > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              Promo
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight text-sm font-medium">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 line-clamp-1 mb-2 leading-tight text-xs">
                            {item.description}
                          </p>
                          {/* Rating Display */}
                          {item.averageRating != null && item.reviewCount != null && item.reviewCount > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-medium text-gray-700">
                                {item.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({item.reviewCount} avis)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {originalPrice ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-red-600">
                                    {priceLabel}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    {new Intl.NumberFormat("fr-FR", {
                                      style: "currency",
                                      currency: "XOF"
                                    }).format(originalPrice)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-gray-900">
                                  {priceLabel}
                                </span>
                              )}
                            </div>
                            <div className="bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors w-6 h-6">
                              <ArrowRight className="w-3 h-3 text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={product?.images || []}
        currentIndex={modalCurrentIndex}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
      />
    </main>
  );
}