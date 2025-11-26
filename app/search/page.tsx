"use client";

import React from "react";
import Link from "next/link";
import { productsApi, vendorsApi, ProductItem, Vendor } from "@/app/lib/api";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LazyImage } from "@/app/components/ui/lazy-image";
import { useSearchParams } from "next/navigation";

const getProductImage = (images: string[] | undefined): string => {
  if (images && images.length > 0) return images[0];
  return "https://placehold.co/300x200/000000/FFFFFF/png?text=Produit";
};

export default function UnifiedSearchPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const type = (searchParams.get("type") as "all" | "products" | "vendors") || "all";

  const [q, setQ] = React.useState(initialQ);
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [vendors, setVendors] = React.useState<Array<Vendor & { _id?: string }>>([]);

  React.useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const tasks: Array<Promise<any>> = [];
        if (type === "all" || type === "products") {
          tasks.push(productsApi.list({ q: initialQ, limit: 12, page: 1 }));
        }
        if (type === "all" || type === "vendors") {
          tasks.push(vendorsApi.list({ q: initialQ, limit: 12, page: 1 }));
        }
        const results = await Promise.all(tasks);
        let p: ProductItem[] = [];
        let v: Array<Vendor & { _id?: string }> = [];
        results.forEach((res) => {
          if (res?.data && Array.isArray(res.data) && res.data.length) {
            if ("price" in res.data[0]) {
              p = res.data as ProductItem[];
            } else {
              v = res.data as Array<Vendor & { _id?: string }>;
            }
          }
        });
        if (type === "products") v = [];
        if (type === "vendors") p = [];
        setProducts(p);
        setVendors(v);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [initialQ, type]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Résultats pour “{initialQ}”</h1>
          <p className="text-sm text-muted-foreground">
            {type === "all" ? "Produits et boutiques" : type === "products" ? "Produits" : "Boutiques"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Recherche en cours…</div>
        ) : (
          <div className="space-y-12">
            {(type === "all" || type === "products") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Produits</h2>
                  <Link href={`/products?q=${encodeURIComponent(initialQ)}`} className="text-primary text-sm hover:underline">
                    Voir tous
                  </Link>
                </div>
                {products.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun produit trouvé</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <Card key={product._id} className="overflow-hidden">
                        <div className="aspect-4/3 relative bg-gray-100">
                          <LazyImage
                            src={getProductImage(product.images)}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          {product.vendor && (
                            <Link href={`/vendor/${product.vendor.vendorSlug}`} className="text-xs text-gray-500 hover:underline">
                              {product.vendor.businessName}
                            </Link>
                          )}
                          <h3 className="font-semibold text-sm line-clamp-1">
                            <Link href={`/vendor/${product.vendor?.vendorSlug || ""}/product/${product._id}`}>
                              {product.name}
                            </Link>
                          </h3>
                          <div className="text-sm font-medium">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(product.price)}
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 pt-0">
                          <Link href={`/vendor/${product.vendor?.vendorSlug || ""}/product/${product._id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">Voir détails</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(type === "all" || type === "vendors") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Boutiques</h2>
                  <Link href={`/vendors?q=${encodeURIComponent(initialQ)}`} className="text-primary text-sm hover:underline">
                    Voir toutes
                  </Link>
                </div>
                {vendors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune boutique trouvée</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vendors.map((vendor) => (
                      <Card key={(vendor as any)._id || vendor.id} className="overflow-hidden">
                        <div className="h-36 relative bg-gray-100">
                          <LazyImage
                            src={vendor.coverImage || "https://placehold.co/800x200/000000/FFFFFF/png?text=Boutique"}
                            alt={vendor.businessName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1">
                            <Link href={`/vendor/${vendor.vendorSlug}`}>
                              {vendor.businessName}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {vendor.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Link href={`/vendor/${vendor.vendorSlug}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">Visiter la boutique</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

