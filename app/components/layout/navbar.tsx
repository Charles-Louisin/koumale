"use client";

import React from "react";
import { authApi, authStorage, productsApi, vendorsApi, ProductItem, Vendor, API_BASE_URL } from "@/app/lib/api";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, Shirt, ChefHat, Book, Briefcase, Search, Folder, HomeIcon, Sparkles, Activity, Gamepad2, Heart, Home, Package, Store, BookOpen, type LucideIcon, LogInIcon, Baby, Car, Camera, Coffee, Dumbbell, Flower, Gift, Glasses, Hammer, Headphones, Laptop, Monitor, Music, Palette, Pill, Scissors, ShoppingBag, Sofa, Wrench, Truck, Watch, Wine, Zap, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/ui/toast";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchType, setSearchType] = React.useState<"all" | "products" | "vendors">("all");
  const [currentUser, setCurrentUser] = React.useState<{ firstName?: string; lastName?: string; role?: "client" | "vendor" | "superAdmin"; status?: "pending" | "approved" } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isAtTop, setIsAtTop] = React.useState(true);
  const [showSearchOnTop, setShowSearchOnTop] = React.useState(false);
  const { toasts, removeToast, info } = useToast();

  const [showResults, setShowResults] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [productResults, setProductResults] = React.useState<ProductItem[] | undefined>(undefined);
  const [vendorResults, setVendorResults] = React.useState<Array<Vendor & { _id?: string }> | undefined>(undefined);
  const searchRef = React.useRef<HTMLDivElement | null>(null);
  const searchBarRef = React.useRef<HTMLInputElement | null>(null);
  const debounceRef = React.useRef<number | undefined>(undefined);
  const [windowWidth, setWindowWidth] = React.useState(0);

  const handleSetSearchQuery = React.useCallback((value: string) => setSearchQuery(value), []);
  const handleSetSearchType = React.useCallback((type: "all" | "products" | "vendors") => setSearchType(type), []);
  const handleSetShowResults = React.useCallback((show: boolean) => setShowResults(show), []);
  const handleSetProductResults = React.useCallback((results: ProductItem[] | undefined) => setProductResults(results), []);
  const handleSetVendorResults = React.useCallback((results: Array<Vendor & { _id?: string }> | undefined) => setVendorResults(results), []);

  const hasData = (val: unknown): val is { data?: unknown } => {
    return typeof val === "object" && val !== null && Object.prototype.hasOwnProperty.call(val as Record<string, unknown>, "data");
  };

  React.useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;
    authApi
      .getMe()
      .then((res) => {
        if (res.success && res.user) {
          setCurrentUser({
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            role: res.user.role,
            status: res.user.status,
          });
        }
      })
      .catch(() => { });
  }, []);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup body overflow on unmount
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle body overflow based on menu state
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const scrollThreshold = viewportHeight * 0.4;

        // Déterminer si on est en haut
        const atTop = currentScrollY <= 10;
        setIsAtTop(atTop);

        // Déterminer la direction du scroll
        const scrollingDown = currentScrollY > lastScrollY + 5;
        const scrollingUp = currentScrollY < lastScrollY - 5;

        if (scrollingDown && currentScrollY >= scrollThreshold) {
          // Scroll vers le bas et seuil atteint
          setShowSearchOnTop(true);
        } else if (scrollingUp) {
          // Scroll vers le haut - retour immédiat
          setShowSearchOnTop(false);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const initials = React.useMemo(() => {
    const f = (currentUser?.firstName || "").trim();
    const l = (currentUser?.lastName || "").trim();
    return `${f ? f[0].toUpperCase() : ""}${l ? l[0].toUpperCase() : ""}` || "?";
  }, [currentUser]);

  const handleLogout = () => {
    authStorage.removeToken();
    setCurrentUser(null);
    router.push("/");
  };

  const handleCreateShopClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      info("Veuillez vous inscrire avant de créer votre boutique.");
    } else if (currentUser.role === "vendor" && currentUser.status === "pending") {
      e.preventDefault();
      info("Votre boutique est en cours d'approbation. Vous serez notifié.");
    } else {
      // User is logged in and not a pending vendor, navigate to register-vendor page
      router.push("/auth/register-vendor");
    }
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      // Prevent body scroll when menu opens
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu closes
      document.body.style.overflow = 'unset';
    }
  };

  // Debounced live search
  React.useEffect(() => {
    const q = (searchQuery || "").trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
    if (q.length < 2) {
      setIsSearching(false);
      setProductResults(undefined);
      setVendorResults(undefined);
      return;
    }
    setIsSearching(true);
    setShowResults(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const tasks: Array<Promise<{ data?: unknown }>> = [];
        if (searchType === "all" || searchType === "products") {
          tasks.push(productsApi.list({ q: q, limit: 8, page: 1 }) as unknown as Promise<{ data?: unknown }>);
        }
        if (searchType === "all" || searchType === "vendors") {
          tasks.push(vendorsApi.list({ q: q, limit: 8, page: 1 }) as unknown as Promise<{ data?: unknown }>);
        }
        const results = await Promise.allSettled(tasks);
        let p: ProductItem[] | undefined;
        let v: Array<Vendor & { _id?: string }> | undefined;
        for (const r of results) {
          if (r.status === "fulfilled") {
            const payload = r.value as unknown;
            if (!hasData(payload)) continue;
            const data = payload.data as unknown;
            if (Array.isArray(data)) {
              const first = data[0] as Record<string, unknown> | undefined;
              if (first && Object.prototype.hasOwnProperty.call(first, "price")) {
                p = data as unknown as ProductItem[];
              } else {
                v = data as unknown as Array<Vendor & { _id?: string }>;
              }
            }
          }
        }
        if (searchType === "products") v = undefined;
        if (searchType === "vendors") p = undefined;
        setProductResults(p);
        setVendorResults(v);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = undefined;
      }
    };
  }, [searchQuery, searchType]);

  // Close dropdown when clicking outside or pressing ESC
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
        searchBarRef.current?.focus();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowResults(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const [categories, setCategories] = React.useState<Array<{ name: string; slug: string; Icon: LucideIcon }>>([]);

  // Fetch categories that have products from backend
  React.useEffect(() => {
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
            const backendCategories = sortedCategories.map((cat: string) => ({
              name: cat,
              slug: cat.toLowerCase().replace(/\s+/g, '-'),
              Icon: getIconForCategory(cat)
            }));
            setCategories(backendCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // No fallback categories - navbar will be empty if backend fails
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to get icon for category
  const getIconForCategory = (categoryName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      "Électronique": Smartphone,
      "Téléphones & Tablettes": Smartphone,
      "Ordinateurs & Accessoires": Laptop,
      "TV & Audio": Monitor,
      "Appareils Photo & Caméras": Camera,
      "Gaming & Consoles": Gamepad2,
      "Vêtements": Shirt,
      "Mode Femme": Shirt,
      "Mode Homme": Shirt,
      "Chaussures": ShoppingBag,
      "Accessoires Mode": Briefcase,
      "Maison & Jardin": HomeIcon,
      "Meubles": Sofa,
      "Décoration": Sofa,
      "Électroménager": Zap,
      "Bricolage": Hammer,
      "Beauté & Santé": Sparkles,
      "Parfums & Cosmétiques": Sparkles,
      "Soins du Corps": Heart,
      "Cheveux & Ongles": Scissors,
      "Santé & Bien-être": Pill,
      "Alimentation": Coffee,
      "Épicerie": Coffee,
      "Boissons": Wine,
      "Produits Bio": Flower,
      "Sports & Loisirs": Activity,
      "Équipement Sportif": Dumbbell,
      "Vélo & Moto": Car,
      "Camping & Randonnée": Flower,
      "Jouets & Jeux": Gamepad2,
      "Livres & Médias": Book,
      "Livres": Book,
      "Musique & Films": Music,
      "Jeux Vidéo": Gamepad2,
      "Auto & Moto": Car,
      "Pièces Auto": Wrench,
      "Accessoires Auto": Car,
      "Équipement Moto": Car,
      "Bébé & Enfant": Baby,
      "Vêtements Bébé": Baby,
      "Puériculture": Baby,
      "Jouets Enfant": Gamepad2,
      "Animaux": Heart,
      "Alimentation Animaux": Heart,
      "Accessoires Animaux": Heart,
      "Jardinage": Flower,
      "Outils & Matériel": Wrench,
      "Semences & Plantes": Flower,
      "Autres": Package,
    };
    return iconMap[categoryName] || Package;
  };



  return (
    <>
      {/* Main Header (top row + bottom search row) */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur transition-all duration-300 ${isAtTop ? "bg-white" : "bg-gray-50 shadow-sm"}`}>
        <div className={`max-w-6xl mx-auto px-6 transition-all duration-300 ${showSearchOnTop ? "py-4" : "py-2"}`}>
          {/* Top row: logo + nav + auth + search (when scrolled down past 40%) */}
          <div className="flex h-16 md:h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-1">
              <Link href="/" className="flex items-center gap-1">
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-10 lg:h-10">
                  <Image src="/images/logo.png" alt="Logo" fill className="object-contain rounded-md" priority />
                </div>
                <span className="text-sm sm:text-sm md:text-lg lg:text-xl font-semibold tracking-tight leading-none">KOUMALE</span>
              </Link>
            </div>

            {/* Desktop Navigation or Search bar - Conditional display */}
            {showSearchOnTop ? (
              // Après 40% de scroll vers le bas : Barre de recherche en haut
              <div className="hidden lg:flex flex-1 justify-center mx-4">
                <motion.div
                  layout="position"
                  layoutId="search-bar"
                  className="w-full max-w-3xl"
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div ref={showSearchOnTop ? searchRef : undefined}>
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full border border-gray-200 shadow-sm bg-white">
                      <div className="flex bg-gray-100 rounded-full p-1 relative">
                        <motion.div
                          layoutId="search-filter-indicator"
                          className="absolute bg-white shadow rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{
                            left: searchType === "all" ? "2px" : searchType === "products" ? "calc(26% + 2px)" : "calc(61%)",
                            width: searchType === "all" ? "calc(30% - 8px)" : searchType === "products" ? "calc(35% - 8px)" : "calc(37% - 4px)",
                            top: "4px",
                            bottom: "4px",
                          }}
                        />
                        <button type="button" onClick={() => setSearchType("all")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "all" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Tout
                        </button>
                        <button type="button" onClick={() => setSearchType("products")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "products" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Produits
                        </button>
                        <button type="button" onClick={() => setSearchType("vendors")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "vendors" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Boutiques
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                        <input
                          ref={searchBarRef}
                          type="text"
                          placeholder="Rechercher produits, boutiques…"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                          }}
                          className="w-full text-sm sm:text-base md:text-lg outline-none bg-transparent placeholder-gray-400"
                        />
                      </div>
                      {isSearching ? (
                        <svg className="w-5 h-5 animate-spin text-gray-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                          <path className="opacity-75" fill="#999" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        searchQuery ? (
                          <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            aria-label="Effacer la recherche"
                            onClick={() => { setSearchQuery(""); setShowResults(false); setProductResults(undefined); setVendorResults(undefined); }}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 8.586l3.95-3.95a1 1 0 111.414 1.414L11.414 10l3.95 3.95a1 1 0 11-1.414 1.414L10 11.414l-3.95 3.95a1 1 0 11-1.414-1.414L8.586 10l-3.95-3.95A1 1 0 016.05 4.636L10 8.586z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : null
                      )}
                    </div>
                    {/* Results dropdown */}
                    {showResults && (productResults || vendorResults) && (
                      <div className="relative">
                        <div className="absolute left-0 right-0 mt-2 z-[101]" onClick={(e) => e.stopPropagation()}>
                          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="max-h-[60vh] overflow-auto">
                              {productResults && (
                                <div className="p-3">
                                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Produits</div>
                                  {productResults.length === 0 ? (
                                    <div className="text-xs text-gray-500 px-2 py-2">Aucun produit</div>
                                  ) : (
                                    <ul className={showSearchOnTop ? "" : "divide-y"}>
                                      {productResults.map((p: ProductItem) => (
                                        <li key={p._id}>
                                          <Link href={`/vendor/${p.vendor?.vendorSlug || ""}/product/${p._id}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={(p.images && p.images[0]) || "/images/phone.jpg"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-sm font-medium truncate">{p.name}</div>
                                              <div className="text-[11px] text-gray-500 truncate">{p.vendor?.businessName || ""} {p.category ? `• ${p.category}` : ""}</div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(p.price)}
                                            </div>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              {vendorResults && (
                                <div className="p-3">
                                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Boutiques</div>
                                  {vendorResults.length === 0 ? (
                                    <div className="text-xs text-gray-500 px-2 py-2">Aucune boutique</div>
                                  ) : (
                                    <ul className="divide-y">
                                      {vendorResults.map((v: Vendor & { _id?: string }) => (
                                        <li key={(v as unknown as { _id?: string })._id || (v as unknown as { id?: string }).id}>
                                          <Link href={`/vendor/${v.vendorSlug}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={v.logo || "/images/phone.jpg"} alt={v.businessName} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-sm font-medium truncate">{v.businessName}</div>
                                              <div className="text-[11px] text-gray-500 truncate">{v.description}</div>
                                            </div>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              // Liens de navigation (par défaut et au scroll vers le haut)
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:flex items-center gap-3 relative"
              >
                {/* Indicateur de page active avec animation simple apparition/disparition */}
                <Link href="/" className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${pathname === "/" ? "text-white bg-orange-400 font-bold" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  <Home className="w-4 h-4" />
                  Accueil
                </Link>
                <Link href="/products" className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${pathname === "/products" ? "text-white bg-orange-400 font-bold" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  <Package className="w-4 h-4" />
                  Produits
                </Link>
                <Link href="/vendors" className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${pathname === "/vendors" ? "text-white bg-orange-400 font-bold" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  <Store className="w-4 h-4" />
                  Boutiques
                </Link>
                {currentUser && (currentUser.role === "superAdmin" || (currentUser.role === "vendor" && currentUser.status === "approved")) && (
                  <Link href={currentUser.role === "superAdmin" ? "/dashboard/admin" : "/dashboard/vendor"} className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-sm md:ml-5 font-medium text-white bg-primary hover:opacity-90 rounded-lg transition shadow-sm">
                    Tableau de bord
                  </Link>
                )}
              </motion.nav>
            )}



            {/* Auth / User - Desktop */}
            <div className="hidden lg:flex items-center gap-3 ml-4">
              <>
                {(!currentUser || currentUser.role === "client" || (currentUser.role === "vendor" && currentUser.status === "pending")) && (
                  <button onClick={handleCreateShopClick} className="ml-4 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-primary rounded-lg transition shadow-sm">
                    Créer ma boutique
                  </button>
                )}

                {currentUser ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                      <div className="text-sm font-medium text-gray-800 whitespace-nowrap">
                        {(currentUser.firstName || "").trim()} {(currentUser.lastName || "").trim()}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition"
                      aria-label="Déconnexion"
                      title="Déconnexion"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition border border-gray-200">
                      Connexion
                    </Link>
                  </>
                )}
              </>
            </div>

            {/* Mobile: Search button or Menu Button */}
            <div className="lg:hidden flex items-center gap-1">

              {currentUser && (currentUser.role === "superAdmin" || (currentUser.role === "vendor" && currentUser.status === "approved")) ? (
                <Link href={currentUser.role === "superAdmin" ? "/dashboard/admin" : "/dashboard/vendor"} className="ml-2 px-2 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-sm font-medium text-white bg-primary rounded-lg transition shadow-sm">
                  Tableau de bord
                </Link>
              ) : (!currentUser || currentUser.role === "client" || (currentUser.role === "vendor" && currentUser.status === "pending")) ? (
                <button onClick={handleCreateShopClick} className="ml-2 px-2 py-1.5 sm:px-4 sm:py-2 md:text-[11px] text-[11px] font-medium text-white bg-primary rounded-lg transition shadow-sm">
                  Créer ma boutique
                </button>
              ) : null}

              <button onClick={toggleMenu} className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition" aria-label="Toggle menu">
                {isMenuOpen ? (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>



          {/* Bottom row: Barre de recherche - Visible par défaut et au scroll vers le haut */}
          {!showSearchOnTop && (
            <div className="px-0 pb-3 md:mt-4">
              <div className="flex w-full justify-center">
                <motion.div
                  layout="position"
                  layoutId="search-bar"
                  className="w-full max-w-3xl"
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div ref={!showSearchOnTop ? searchRef : undefined}>
                    <div className={`flex items-center gap-1 sm:gap-2 md:gap-3 px-2 py-3 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full border border-gray-200 shadow-sm bg-white ${windowWidth <= 400 ? 'py-4' : ''}`}>
                      <div className={`${windowWidth > 400 ? 'flex' : 'hidden'} bg-gray-100 rounded-full p-1 relative`}>
                        <motion.div
                          layoutId="search-filter-indicator"
                          className="absolute bg-white shadow rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{
                            left: searchType === "all" ? "2px" : searchType === "products" ? "calc(26% + 2px)" : "calc(61%)",
                            width: searchType === "all" ? "calc(30% - 8px)" : searchType === "products" ? "calc(35% - 8px)" : "calc(37% - 4px)",
                            top: "4px",
                            bottom: "4px",
                          }}
                        />
                        <button type="button" onClick={() => setSearchType("all")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "all" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Tout
                        </button>
                        <button type="button" onClick={() => setSearchType("products")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "products" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Produits
                        </button>
                        <button type="button" onClick={() => setSearchType("vendors")} className={`relative z-10 px-3 py-1.5 cursor-pointer text-xs rounded-full transition-colors ${searchType === "vendors" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                          Boutiques
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                        <input
                          ref={searchBarRef}
                          type="text"
                          placeholder="Rechercher produits, boutiques…"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                          }}
                          className="w-full text-sm sm:text-base md:text-lg outline-none bg-transparent placeholder-gray-400"
                        />
                      </div>
                      {isSearching ? (
                        <svg className="w-5 h-5 animate-spin text-gray-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                          <path className="opacity-75" fill="#999" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        searchQuery ? (
                          <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            aria-label="Effacer la recherche"
                            onClick={() => { setSearchQuery(""); setShowResults(false); setProductResults(undefined); setVendorResults(undefined); }}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 8.586l3.95-3.95a1 1 0 111.414 1.414L11.414 10l3.95 3.95a1 1 0 11-1.414 1.414L10 11.414l-3.95 3.95a1 1 0 11-1.414-1.414L8.586 10l-3.95-3.95A1 1 0 016.05 4.636L10 8.586z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : null
                      )}
                    </div>

                    {/* Results dropdown under navbar */}
                    {showResults && (productResults || vendorResults) && (
                      <div className="relative">
                        <div className="absolute left-0 right-0 mt-2 z-50" onClick={(e) => e.stopPropagation()}>
                          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="max-h-[60vh] overflow-auto">
                              {productResults && (
                                <div className="p-3">
                                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Produits</div>
                                  {productResults.length === 0 ? (
                                    <div className="text-xs text-gray-500 px-2 py-2">Aucun produit</div>
                                  ) : (
                                    <ul className="">
                                      {productResults.map((p: ProductItem) => (
                                        <li key={p._id}>
                                          <Link href={`/vendor/${p.vendor?.vendorSlug || ""}/product/${p._id}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={(p.images && p.images[0]) || "/images/phone.jpg"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-sm font-medium truncate">{p.name}</div>
                                              <div className="text-[11px] text-gray-500 truncate">{p.vendor?.businessName || ""} {p.category ? `• ${p.category}` : ""}</div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(p.price)}
                                            </div>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {vendorResults && (
                                <div className="p-3">
                                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Boutiques</div>
                                  {vendorResults.length === 0 ? (
                                    <div className="text-xs text-gray-500 px-2 py-2">Aucune boutique</div>
                                  ) : (
                                    <ul className="">
                                      {vendorResults.map((v: Vendor & { _id?: string }) => (
                                        <li key={(v as unknown as { _id?: string })._id || (v as unknown as { id?: string }).id}>
                                          <Link href={`/vendor/${v.vendorSlug}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={v.logo || "/images/phone.jpg"} alt={v.businessName} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-sm font-medium truncate">{v.businessName}</div>
                                              <div className="text-[11px] text-gray-500 truncate">{v.description}</div>
                                            </div>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Catégories Section - Visible uniquement en haut de page */}
          <AnimatePresence>
            {categories.length > 0 && isAtTop && (
              <motion.section
                key="categories"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="md:pt-1 md:pb-10 px-4 md:px-6"
                aria-labelledby="categories-heading"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-3 mt-2 md:mb-4 md:mt-2">
                    <p className={`${windowWidth < 400 ? 'text-[11px]' : 'text-sm'} text-gray-600`}>Trouvez facilement ce dont vous avez besoin par categorie</p>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/products?category=${category.slug}`}
                          className={`${windowWidth < 400 ? 'p-1' : 'p-4'} group bg-white rounded-xl shadow-lg transition transform hover:-translate-y-1 flex flex-col items-center text-center shrink-0 h-fit  min-w-[120px]`}
                        >
                          <div className="mb-2 group-hover:scale-105 transition-transform">
                            <category.Icon className={`${windowWidth < 400 ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
                          </div>
                          <h3 className={`${windowWidth < 400 ? 'text-xs' : 'text-sm'} font-medium text-gray-800 group-hover:text-primary`}>
                            {category.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="flex flex-col h-full">
              {/* Header du menu mobile */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Image src="/images/logo.png" alt="Logo" fill className="object-contain rounded-md" priority />
                  </div>
                  <span className="text-lg font-semibold tracking-tight leading-none">KOUMALE</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition" aria-label="Fermer le menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation principale */}
              <nav className="flex-1 p-6 space-y-2">
                <Link href="/" className={`flex items-center gap-4 px-5 py-4 text-base font-medium rounded-xl transition-all duration-300 ${pathname === "/" ? "text-white bg-primary shadow-lg" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`} onClick={() => { setIsMenuOpen(false); }}>
                  <Home className="w-6 h-6" />
                  <span>Accueil</span>
                </Link>
                <Link href="/products" className={`flex items-center gap-4 px-5 py-4 text-base font-medium rounded-xl transition-all duration-300 ${pathname === "/products" ? "text-white bg-primary shadow-lg" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`} onClick={() => { setIsMenuOpen(false); }}>
                  <Package className="w-6 h-6" />
                  <span>Produits</span>
                </Link>
                <Link href="/vendors" className={`flex items-center gap-4 px-5 py-4 text-base font-medium rounded-xl transition-all duration-300 ${pathname === "/vendors" ? "text-white bg-primary shadow-lg" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`} onClick={() => { setIsMenuOpen(false); }}>
                  <Store className="w-6 h-6" />
                  <span>Boutiques</span>
                </Link>

                {/* Section catégories */}
                {/* {categories.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Catégories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.slug}
                          href={`/products?category=${category.slug}`}
                          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                          onClick={() => { setIsMenuOpen(false); }}
                        >
                          <category.Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-gray-700 text-center">{category.name}</span>
                        </Link>
                      ))}
                    </div>
                    {categories.length > 6 && (
                      <Link href="/products" className="block mt-4 text-center text-sm text-primary hover:text-primary/80 font-medium" onClick={() => { setIsMenuOpen(false); }}>
                        Voir toutes les catégories →
                      </Link>
                    )}
                  </div>
                )} */}

                {/* Section compte utilisateur */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                  {currentUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {(currentUser.firstName || "").trim()} {(currentUser.lastName || "").trim()}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {currentUser.role === 'superAdmin' ? 'Administrateur' : currentUser.role === 'vendor' ? 'Vendeur' : 'Client'}
                          </div>
                        </div>
                      </div>

                      {/* Liens du tableau de bord selon le rôle */}
                      {(currentUser.role === "superAdmin" || (currentUser.role === "vendor" && currentUser.status === "approved")) && (
                        <Link
                          href={currentUser.role === "superAdmin" ? "/dashboard/admin" : "/dashboard/vendor"}
                          className="flex items-center gap-4 px-5 py-4 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-sm"
                          onClick={() => { setIsMenuOpen(false); }}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Tableau de bord</span>
                        </Link>
                      )}

                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="flex items-center gap-4 px-5 py-4 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 w-full text-left"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-4 px-5 py-4 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-sm"
                        onClick={() => { setIsMenuOpen(false); }}
                      >
                        <LogInIcon />
                        <span>Connexion</span>
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex items-center justify-center gap-4 px-5 py-4 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-sm"
                        onClick={() => { setIsMenuOpen(false); }}
                      >
                        <UserPlus />
                        <span>S&apos;inscrire</span>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
