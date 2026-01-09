"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Trash2, Plus, Minus, Edit2, X } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '@/app/contexts/CartContext';
import { LazyImage } from '@/app/components/ui/lazy-image';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart } = useCart();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState(item.note || '');
  const [quantity, setQuantity] = useState(item.quantity);

  const product = item.product;
  
  // Vérifier que le produit existe
  if (!product) {
    return null;
  }
  
  const price = product.promotionalPrice || product.price;
  const totalItemPrice = price * item.quantity;

  const getProductImage = (images: string[]) => {
    if (!images || images.length === 0) {
      return '/images/logo.png';
    }
    return images[0];
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(item._id);
      return;
    }
    setQuantity(newQuantity);
    try {
      await updateCartItem(item._id, newQuantity);
    } catch (error) {
      setQuantity(item.quantity);
    }
  };

  const handleNoteSave = async () => {
    try {
      await updateCartItem(item._id, undefined, note);
      setIsEditingNote(false);
    } catch (error) {
      // Error handling
    }
  };

  const handleNoteCancel = () => {
    setNote(item.note || '');
    setIsEditingNote(false);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link
            href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden">
              <LazyImage
                src={getProductImage(product.images || [])}
                alt={product.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}
                  className="block"
                >
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Vendeur: <span className="font-medium">{product.vendor?.businessName || 'N/A'}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {product.promotionalPrice ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        {product.promotionalPrice.toLocaleString()} FCFA
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {product.price.toLocaleString()} FCFA
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromCart(item._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Quantité:</span>
                <div className="flex items-center gap-1 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="text"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(val);
                    }}
                    onBlur={() => handleQuantityChange(quantity)}
                    min="1"
                    className="w-10! h-8 text-center border-0 "
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-right md:flex md:items-center md:gap-2">
                <div className="text-sm text-gray-600">Sous-total :</div>
                <div className="text-lg font-bold text-gray-900">
                  {totalItemPrice.toLocaleString()} FCFA
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-4">
              {!isEditingNote ? (
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    {item.note ? (
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                        <span className="font-medium">Note:</span> {item.note}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Aucune note</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNote(true)}
                    className="flex-shrink-0"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {item.note ? 'Modifier' : 'Ajouter une note'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajoutez une note pour ce produit (ex: couleur, taille, etc.)"
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleNoteSave}
                      className="flex-1"
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNoteCancel}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

