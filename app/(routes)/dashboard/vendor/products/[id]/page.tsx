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
import { categoriesApi, productsApi } from "@/app/lib/api";
import { Package, DollarSign, Image, Settings, ArrowLeft, Save, Send, PlusCircle, Plus, ImageIcon } from "lucide-react";

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

  // categories
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  // Load categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list();
        if (response.success && response.data) {
          setCategories(response.data.sort((a, b) => a.localeCompare(b)));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Modifier le produit</h1>
          <p className="text-gray-600">Modifiez les informations de votre produit</p>
        </div>
        <Link href="/dashboard/vendor/products">
          <Button variant="outline" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
        <Card className="border-0 p-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                placeholder="Nom du produit"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée du produit..."
                className="min-h-32 mt-1"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? "Chargement des catégories..." : "Sélectionner une catégorie"}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Prix et promotion */}
        <Card className="border-0 p-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Prix et promotion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="promotionalPrice">Prix promotionnel (FCFA)</Label>
                <Input
                  id="promotionalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={promotionalPrice}
                  onChange={(e) => setPromotionalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Optionnel - Doit être inférieur au prix normal</p>
              </div>
            </div>

            {/* Aperçu des prix */}
            {price && promotionalPrice && discountPercentage > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-orange-800">Aperçu de la promotion</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-orange-600">{promotionalPrice} FCFA</span>
                  <span className="text-sm text-gray-500 line-through">{price} FCFA</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images du produit */}
        <Card className="border-0 p-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              Images du produit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Images du produit</Label>
              <div className="mt-1">
                <UploadFile
                  endpoint="productImage"
                  accept="image/*"
                  maxFiles={5}
                  value={images}
                  onChange={(files) => setImages(files)}
                  placeholder="Ajoutez jusqu'à 5 images de votre produit. La première image sera l'image principale."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attributs du produit */}
        <Card className="border-0 p-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Attributs du produit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Attributs standards */}
            <div>
              <Label className="text-base font-medium">Attributs standards</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    placeholder="Marque du produit"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modèle</Label>
                  <Input
                    id="model"
                    placeholder="Modèle du produit"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Attributs personnalisés */}
            <div>
              <Label className="text-base font-medium">Attributs personnalisés</Label>
              <div className="border border-gray-300 rounded-lg p-4 mt-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Ajoutez des attributs personnalisés pour décrire votre produit (couleur, taille, etc.)
                  </p>
                  <Button className="flex items-center" type="button" variant="outline" size="md" onClick={addCustomAttribute}>
                    <Plus/>Attribut
                  </Button>
                </div>
                {customAttributes.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    Aucun attribut personnalisé ajouté
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customAttributes.map((attr, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-2">
                          <Label>Clé (ex: Pointure)</Label>
                          <Input
                            placeholder="Clé"
                            value={attr.key}
                            onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Valeur (ex: 40-45)</Label>
                          <Input
                            placeholder="Valeur"
                            value={attr.value}
                            onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeCustomAttribute(index)}
                          className="mb-0 !bg-red-500 !text-white !border-red-600 hover:!bg-red-700 hover:!border-red-700"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Link href="/dashboard/vendor/products">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}
