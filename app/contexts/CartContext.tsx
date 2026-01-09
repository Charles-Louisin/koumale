"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, Cart, CartItem, authStorage } from '@/app/lib/api';
import { useToast } from '@/app/contexts/ToastContext';

interface LocalCartItem {
  productId: string;
  quantity: number;
  selectedAttributes?: Record<string, unknown>;
  note?: string;
  timestamp: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  addToCart: (productId: string, quantity?: number, selectedAttributes?: Record<string, unknown>, note?: string, productName?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity?: number, note?: string, selectedAttributes?: Record<string, unknown>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  syncLocalCart: () => Promise<void>;
}

const CART_STORAGE_KEY = 'koumale_local_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper functions for localStorage
const getLocalCart = (): LocalCartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: LocalCartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const clearLocalCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toastHook = useToast();
  const { success, error: showError } = toastHook;
  
  // Debug: vérifier le hook toast
  React.useEffect(() => {
    console.log('[CartContext] useToast result:', toastHook);
    console.log('[CartContext] success function:', success);
  }, [toastHook, success]);

  // Check authentication status
  const checkAuth = useCallback(() => {
    const token = authStorage.getToken();
    setIsAuthenticated(!!token);
    return !!token;
  }, []);

  const refreshCart = useCallback(async () => {
    const token = authStorage.getToken();
    setIsAuthenticated(!!token);
    
    if (!token) {
      // Load from localStorage
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        // Create a minimal cart object from local items
        // We'll need product data which we can't get without API
        // So we'll just track item count
        const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);
        setCart({
          _id: 'local',
          items: [],
          totalPrice: 0,
          totalItems
        } as Cart);
      } else {
        setCart(null);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        setCart(response.data);
        // Clear local cart after successful sync
        clearLocalCart();
      } else {
        setCart(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du panier');
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync local cart to server when user logs in
  const syncLocalCart = useCallback(async () => {
    if (!checkAuth()) return;

    const localItems = getLocalCart();
    if (localItems.length === 0) return;

    try {
      for (const item of localItems) {
        try {
          await cartApi.addToCart({
            productId: item.productId,
            quantity: item.quantity,
            selectedAttributes: item.selectedAttributes,
            note: item.note
          });
        } catch (err) {
          console.error('Error syncing cart item:', err);
        }
      }
      clearLocalCart();
      await refreshCart();
      success('Panier synchronisé avec succès', 3000);
    } catch (err) {
      showError('Erreur lors de la synchronisation du panier', 4000);
    }
  }, [checkAuth, refreshCart, success, showError]);

  useEffect(() => {
    refreshCart();
    // Check auth on mount and when storage changes
    const handleStorageChange = () => {
      checkAuth();
      refreshCart();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCart, checkAuth]);

  const addToCart = useCallback(async (
    productId: string,
    quantity: number = 1,
    selectedAttributes?: Record<string, unknown>,
    note?: string,
    productName?: string
  ) => {
    if (!checkAuth()) {
      // Save to localStorage for non-authenticated users
      const localItems = getLocalCart();
      const existingIndex = localItems.findIndex(
        item => item.productId === productId &&
        JSON.stringify(item.selectedAttributes || {}) === JSON.stringify(selectedAttributes || {})
      );

      if (existingIndex >= 0) {
        localItems[existingIndex].quantity += quantity;
        if (note) localItems[existingIndex].note = note;
      } else {
        localItems.push({
          productId,
          quantity,
          selectedAttributes,
          note,
          timestamp: Date.now()
        });
      }

      saveLocalCart(localItems);
      
      // Update local cart state
      const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);
      setCart({
        _id: 'local',
        items: [],
        totalPrice: 0,
        totalItems
      } as Cart);
      
      console.log('[CartContext] Calling success toast for non-authenticated user');
      const message = productName 
        ? `${productName} ajouté au panier`
        : 'Produit ajouté au panier';
      const toastId = success(message, 3000);
      console.log('[CartContext] Success toast called, returned ID:', toastId);
      return;
    }

    try {
      setError(null);
      const response = await cartApi.addToCart({
        productId,
        quantity,
        selectedAttributes,
        note
      });
      if (response.success && response.data) {
        setCart(response.data);
        console.log('[CartContext] Calling success toast for authenticated user');
        const message = productName 
          ? `${productName} ajouté au panier`
          : 'Produit ajouté au panier';
        const toastId = success(message, 3000);
        console.log('[CartContext] Success toast called, returned ID:', toastId);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout au panier');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      setError(errorMessage);
      showError(errorMessage, 4000);
      throw err;
    }
  }, [checkAuth, success, showError]);

  const updateCartItem = useCallback(async (
    itemId: string,
    quantity?: number,
    note?: string,
    selectedAttributes?: Record<string, unknown>
  ) => {
    if (!checkAuth()) {
      showError('Vous devez être connecté pour modifier le panier', 4000);
      throw new Error('Authentification requise');
    }

    try {
      setError(null);
      const response = await cartApi.updateCartItem(itemId, {
        quantity,
        note,
        selectedAttributes
      });
      if (response.success && response.data) {
        setCart(response.data);
        success('Panier mis à jour', 3000);
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      showError(errorMessage, 4000);
      throw err;
    }
  }, [checkAuth, success, showError]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!checkAuth()) {
      showError('Vous devez être connecté pour modifier le panier', 4000);
      throw new Error('Authentification requise');
    }

    try {
      setError(null);
      const response = await cartApi.removeFromCart(itemId);
      if (response.success && response.data) {
        setCart(response.data);
        success('Produit retiré du panier', 3000);
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      showError(errorMessage, 4000);
      throw err;
    }
  }, [checkAuth, success, showError]);

  const clearCart = useCallback(async () => {
    if (!checkAuth()) {
      clearLocalCart();
      setCart(null);
      success('Panier vidé', 3000);
      return;
    }

    try {
      setError(null);
      const response = await cartApi.clearCart();
      if (response.success && response.data) {
        setCart(response.data);
        success('Panier vidé', 3000);
      } else {
        throw new Error(response.message || 'Erreur lors du vidage du panier');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du vidage du panier';
      setError(errorMessage);
      showError(errorMessage, 4000);
      throw err;
    }
  }, [checkAuth, success, showError]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        isAuthenticated,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        syncLocalCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export Cart type for use in components
export type { Cart, CartItem };

