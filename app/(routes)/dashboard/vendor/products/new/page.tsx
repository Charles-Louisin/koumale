"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { UploadFile } from "@/app/components/ui/upload-file";
import { productsApi } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const { toasts, success, error: toastError, removeToast } = useToast();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState<number | "">("");
  const [promotionalPrice, setPromotionalPrice] = React.useState<number | "">("");
  const [category, setCategory] = React.useState("");
  const [images, setImages] = React.useState<Array<{ name: string; url: string }>>([]);

  // attributes
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [customAttributes, setCustomAttributes] = React.useState<Array<{ key: string; value: string }>>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category || price === "" || images.length === 0) return;
    setSubmitting(true);
    try {
      const attributes: Record<string, unknown> = {};
      if (brand) attributes.brand = brand;
      if (model) attributes.model = model;
      customAttributes.forEach(({ key, value }) => {
        if (key.trim()) attributes[key.trim()] = value;
      });

      const res = await productsApi.create({
        name,
        description,
        price: typeof price === "number" ? price : parseFloat(String(price)),
        promotionalPrice: promotionalPrice !== "" ? (typeof promotionalPrice === "number" ? promotionalPrice : parseFloat(String(promotionalPrice))) : undefined,
        category,
        images: images.map((f) => f.url),
        attributes,
      });

      if (res.success) {
        success("Produit publié");
        router.push("/dashboard/vendor/products");
      }
    } catch (err) {
      console.error(err);
      toastError(err instanceof Error ? err.message : "Erreur lors de la création du produit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!name || !description || !category || price === "" || images.length === 0) {
      toastError("Veuillez remplir les champs requis et ajouter au moins une image");
      return;
    }
    setSubmitting(true);
    try {
      const attributes: Record<string, unknown> = {};
      if (brand) attributes.brand = brand;
      if (model) attributes.model = model;
      customAttributes.forEach(({ key, value }) => {
        if (key.trim()) attributes[key.trim()] = value;
      });

      const created = await productsApi.create({
        name,
        description,
        price: typeof price === "number" ? price : parseFloat(String(price)),
        category,
        images: images.map((f) => f.url),
        attributes,
      });
      if (created.success && created.data && '_id' in created.data) {
        const id = created.data._id as string;
        await productsApi.update(id, { isActive: false });
        success("Brouillon enregistré");
        router.push("/dashboard/vendor/products");
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement du brouillon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ajouter un produit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>
            Remplissez les informations pour créer un nouveau produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" placeholder="Nom du produit" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée du produit..."
                className="min-h-32"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" required value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionalPrice">Prix promotionnel (FCFA)</Label>
                <Input id="promotionalPrice" type="number" min="0" step="0.01" placeholder="0.00" value={promotionalPrice} onChange={(e) => setPromotionalPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                <p className="text-xs text-gray-500">Optionnel - doit être inférieur au prix normal</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Vêtements">Vêtements</option>
                  <option value="Maison">Maison</option>
                  <option value="Beauté">Beauté</option>
                  <option value="Alimentation">Alimentation</option>
                </select>
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
              <Label htmlFor="images">Images du produit</Label>
              <UploadFile
                endpoint="productImage"
                accept="image/*"
                maxFiles={5}
                onChange={(files) => setImages(files)}
                placeholder="Ajoutez jusqu'à 5 images de votre produit. La première image sera l'image principale."
              />
            </div>

            <div className="space-y-2">
              <Label>Attributs standards</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input id="brand" placeholder="Marque du produit" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Input id="model" placeholder="Modèle du produit" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attributs personnalisés</Label>
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des attributs personnalisés pour votre produit
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomAttribute}>
                    Ajouter un attribut
                  </Button>
                </div>
                {customAttributes.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Aucun attribut personnalisé ajouté
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customAttributes.map((attr, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <Input
                          placeholder="Clé (ex: couleur)"
                          value={attr.key}
                          onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                          className="md:col-span-2"
                        />
                        <Input
                          placeholder="Valeur (ex: rouge)"
                          value={attr.value}
                          onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                          className="md:col-span-2"
                        />
                        <Button type="button" variant="outline" onClick={() => removeCustomAttribute(index)}>Supprimer</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/dashboard/vendor/products">
                <Button variant="outline">Annuler</Button>
              </Link>
              <Button type="submit" disabled={submitting}>{submitting ? 'Publication...' : 'Publier le produit'}</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2" />
      </Card>
    </div>
  );
}
