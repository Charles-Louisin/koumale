"use client";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { UploadFile } from "@/app/components/ui/upload-file";
import { productsApi } from "@/app/lib/api";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [promotionalPrice, setPromotionalPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<Array<{ name: string; url: string }>>([]);
  const [attributes, setAttributes] = useState<Record<string, unknown>>({});
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [customAttributes, setCustomAttributes] = useState<Array<{ key: string; value: string }>>([]);
  const addCustomAttribute = () => setCustomAttributes((prev) => [...prev, { key: "", value: "" }]);
  const updateCustomAttribute = (index: number, field: "key" | "value", value: string) => {
    setCustomAttributes((prev) => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));
  };
  const removeCustomAttribute = (index: number) => setCustomAttributes((prev) => prev.filter((_, i) => i !== index));

  // Calcul automatique du pourcentage de réduction
  const discountPercentage = React.useMemo(() => {
    if (price && promotionalPrice && typeof price === "number" && typeof promotionalPrice === "number" && promotionalPrice < price) {
      return Math.round(((price - promotionalPrice) / price) * 100);
    }
    return 0;
  }, [price, promotionalPrice]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await productsApi.getById(id);
        if (res.success && res.data) {
          const p = res.data;
          setName(p.name);
          setDescription(p.description);
          setPrice(p.price);
          setPromotionalPrice(p.promotionalPrice || "");
          setCategory(p.category);
          setImages((p.images || []).map((url: string, i: number) => ({ name: `image-${i}`, url })));
          const attrs = p.attributes || {};
          setAttributes(attrs);
          setBrand(String(attrs.brand ?? ""));
          setModel(String(attrs.model ?? ""));
          const rest: Array<{ key: string; value: string }> = Object.entries(attrs)
            .filter(([k]) => k !== 'brand' && k !== 'model')
            .map(([key, value]) => ({ key, value: String(value) }));
          setCustomAttributes(rest);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalAttrs: Record<string, unknown> = {};
      if (brand) finalAttrs.brand = brand;
      if (model) finalAttrs.model = model;
      customAttributes.forEach(({ key, value }) => { if (key.trim()) finalAttrs[key.trim()] = value; });

      await productsApi.update(id, {
        name,
        description,
        price: typeof price === "number" ? price : parseFloat(String(price)),
        promotionalPrice: promotionalPrice !== "" ? (typeof promotionalPrice === "number" ? promotionalPrice : parseFloat(String(promotionalPrice))) : undefined,
        category,
        images: images.map((f) => f.url),
        attributes: finalAttrs,
      });
      router.push("/dashboard/vendor/products");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Modifier le produit</h1>
        <Link href="/dashboard/vendor/products"><Button variant="outline">Annuler</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>Modifiez les champs et enregistrez</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionalPrice">Prix promotionnel (FCFA)</Label>
                <Input id="promotionalPrice" type="number" min="0" step="0.01" value={promotionalPrice} onChange={(e) => setPromotionalPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                <p className="text-xs text-gray-500">Optionnel - doit être inférieur au prix normal</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
            </div>

            {/* Aperçu des prix */}
            {price && promotionalPrice && discountPercentage > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold mb-2">Aperçu des prix</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">{promotionalPrice} FCFA</span>
                  <span className="text-sm text-gray-500 line-through">{price} FCFA</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                    -{discountPercentage}%
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Images</Label>
              <UploadFile endpoint="productImage" accept="image/*" maxFiles={5} value={images} onChange={(f) => setImages(f)} />
            </div>
            <div className="space-y-2">
              <Label>Attributs standards</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attributs personnalisés</Label>
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Ajoutez des attributs personnalisés pour votre produit</p>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomAttribute}>Ajouter un attribut</Button>
                </div>
                {customAttributes.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">Aucun attribut personnalisé ajouté</div>
                ) : (
                  <div className="space-y-2">
                    {customAttributes.map((attr, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <Input placeholder="Clé" value={attr.key} onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)} className="md:col-span-2" />
                        <Input placeholder="Valeur" value={attr.value} onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)} className="md:col-span-2" />
                        <Button type="button" variant="outline" onClick={() => removeCustomAttribute(index)}>Supprimer</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
