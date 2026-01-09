"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { SkeletonLoading } from '@/app/components/ui/skeleton-loading';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';
import CartItem from '@/app/components/cart/CartItem';
import CartSummary from '@/app/components/cart/CartSummary';
import VendorContactModal from '@/app/components/cart/VendorContactModal';

export default function CartPage() {
  const { cart, loading, error, clearCart } = useCart();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactVendors = () => {
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <SkeletonLoading type="products" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen pt-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-8 h-8" />
                Panier
              </h1>
              {!isEmpty && (
                <p className="text-gray-600 mt-1">
                  {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''} - {cart.totalPrice.toLocaleString()} FCFA
                </p>
              )}
            </div>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vider le panier
            </Button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart */
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Votre panier est vide
              </h2>
              <p className="text-gray-600 mb-6">
                Découvrez nos produits et commencez vos achats !
              </p>
              <Link href="/products">
                <Button size="sm">
                  Explorer les produits
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Articles dans votre panier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.items
                      .filter((item) => item.product) // Filtrer les items avec des produits null
                      .map((item) => (
                        <CartItem key={item._id} item={item} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary onContactVendors={handleContactVendors} />
            </div>
          </div>
        )}

        {/* Vendor Contact Modal */}
        <VendorContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          cart={cart}
        />
      </div>
    </div>
  );
}
