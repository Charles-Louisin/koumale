"use client";

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';
import { useToast } from '@/app/contexts/ToastContext';
import { ProductItem, authStorage } from '@/app/lib/api';

interface AddToCartButtonProps {
  product: ProductItem;
  variant?: 'default' | 'icon' | 'mobile-icon';
  size?: 'sm' | 'md';
  className?: string;
}

export default function AddToCartButton({
  product,
  variant = 'default',
  size = 'md',
  className = ''
}: AddToCartButtonProps) {
  const { addToCart, isAuthenticated } = useCart();
  const toastHook = useToast();
  const { success, error, info } = toastHook;
  const [isAdding, setIsAdding] = useState(false);
  
  // Debug: vérifier si le contexte est utilisé
  React.useEffect(() => {
    console.log('[AddToCartButton] useToast result:', toastHook);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    // Vérifier si l'utilisateur est connecté
    const token = authStorage.getToken();
    if (!token || !isAuthenticated) {
      console.log('[AddToCartButton] User not authenticated, showing info toast');
      console.log('[AddToCartButton] toastHook before call:', toastHook);
      const result = info('Vous devez vous connecter d\'abord', 4000);
      console.log('[AddToCartButton] Info toast called, result:', result);
      console.log('[AddToCartButton] toastHook after call:', toastHook);
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product._id, 1, undefined, undefined, product.name);
      // Le toast est déjà affiché par CartContext
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      error(errorMessage, 4000);
    } finally {
      setIsAdding(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        variant="outline"
        size={size}
        className={`rounded-full p-2 hover:bg-primary hover:text-white transition-colors ${className}`}
        title="Ajouter au panier"
      >
        <ShoppingCart className="w-4 h-4" />
      </Button>
    );
  }

  if (variant === 'mobile-icon') {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        variant="outline"
        size="sm"
        className={`lg:hidden rounded-full hover:bg-primary hover:text-white transition-colors ${className}`}
        title="Ajouter au panier"
      >
        <ShoppingCart className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      size={size}
      className={`${className}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isAdding ? 'Ajout...' : 'Ajouter au panier'}
    </Button>
  );
}
