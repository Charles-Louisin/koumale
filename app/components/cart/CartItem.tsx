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
      <CardContent className="p-2 max-[485px]:p-2">
        <div className="flex gap-2 max-[485px]:gap-2">
          {/* Product Image */}
          <Link
            href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-16 h-16 max-[485px]:w-16 max-[485px]:h-16 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden">
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
            <div className="flex justify-between items-start gap-2 max-[485px]:gap-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 max-[485px]:flex max-[485px]:items-center">
                  <Link
                    href={`/vendor/${product.vendor?.vendorSlug || ''}/product/${product._id}`}
                    className="block flex-1 min-w-0"
                  >
                    <h3 className="font-semibold text-sm max-[485px]:text-xs text-gray-900 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 max-[485px]:h-6 max-[485px]:w-6 max-[485px]:p-0"
                  >
                    <Trash2 className="w-3 h-3 max-[485px]:w-3 max-[485px]:h-3" />
                  </Button>
                </div>
                <p className="text-xs max-[485px]:text-[10px] text-gray-600 mt-0.5 max-[485px]:mt-0">
                  Vendeur: <span className="font-medium">{product.vendor?.businessName || 'N/A'}</span>
                </p>
                <div className="flex items-center gap-1.5 max-[485px]:gap-1 mt-1 max-[485px]:mt-0.5">
                  {product.promotionalPrice ? (
                    <>
                      <span className="text-sm max-[485px]:text-xs font-bold text-primary">
                        {product.promotionalPrice.toLocaleString()} FCFA
                      </span>
                      <span className="text-xs max-[485px]:text-[10px] text-gray-400 line-through">
                        {product.price.toLocaleString()} FCFA
                      </span>
                    </>
                  ) : (
                    <span className="text-sm max-[485px]:text-xs font-bold text-gray-900">
                      {product.price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col max-[485px]:flex-col gap-2 max-[485px]:gap-2 mt-3 max-[485px]:mt-2">
              <div className="flex items-center gap-2 max-[485px]:gap-1.5">
                <span className="text-xs max-[485px]:text-[10px] text-gray-600">Quantité:</span>
                <div className="flex items-center gap-0.5 max-[485px]:gap-0.5 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="h-9 w-9 max-[485px]:h-8 max-[485px]:w-8 p-0"
                  >
                    <Minus className="w-6 h-6 max-[485px]:w-5 max-[485px]:h-5 stroke-[2.5]" />
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
                    className="w-9 max-[485px]:w-8 h-9 max-[485px]:h-8 text-center border-0 text-xs max-[485px]:text-[10px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="h-9 w-9 max-[485px]:h-8 max-[485px]:w-8 p-0"
                  >
                    <Plus className="w-6 h-6 max-[485px]:w-5 max-[485px]:h-5 stroke-[2.5]" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-start gap-2 max-[485px]:justify-start max-[485px]:gap-2">
                <div className="text-xs max-[485px]:text-[10px] text-gray-600">Sous-total :</div>
                <div className="text-sm max-[485px]:text-xs font-bold text-gray-900">
                  {totalItemPrice.toLocaleString()} FCFA
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-3 max-[485px]:mt-2">
              {!isEditingNote ? (
                <div className="flex flex-col max-[485px]:flex-col gap-2 max-[485px]:gap-1.5">
                  <div className="flex-1">
                    {item.note ? (
                      <div className="text-xs max-[485px]:text-[10px] text-gray-700 bg-gray-50 p-1.5 max-[485px]:p-1 rounded-md">
                        <span className="font-medium">Note:</span> {item.note}
                      </div>
                    ) : (
                      <span className="text-xs max-[485px]:text-[10px] text-gray-500 italic">Aucune note</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNote(true)}
                    className="flex-shrink-0 w-full max-[485px]:w-full text-xs max-[485px]:text-[10px] h-7 max-[485px]:h-6"
                  >
                    <Edit2 className="w-3 h-3 max-[485px]:w-2.5 max-[485px]:h-2.5 mr-1" />
                    {item.note ? 'Modifier' : 'Ajouter une note'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-[485px]:space-y-1.5">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajoutez une note pour ce produit (ex: couleur, taille, etc.)"
                    rows={2}
                    className="text-xs max-[485px]:text-[10px]"
                  />
                  <div className="flex gap-2 max-[485px]:gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleNoteSave}
                      className="flex-1 text-xs max-[485px]:text-[10px] h-7 max-[485px]:h-6"
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNoteCancel}
                      className="flex-1 text-xs max-[485px]:text-[10px] h-7 max-[485px]:h-6"
                    >
                      <X className="w-3 h-3 max-[485px]:w-2.5 max-[485px]:h-2.5 mr-1" />
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

