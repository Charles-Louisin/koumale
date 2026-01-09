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
      <div className="max-w-7xl mx-auto px-2 max-[485px]:px-2 md:px-6 py-4 max-[485px]:py-3">
        {/* Header */}
        <div className="flex justify-between items-center max-[485px]:flex gap-3 max-[485px]:gap-2 mb-6 max-[485px]:mb-4">
          <div className="flex items-center gap-2 max-[485px]:gap-2">
            <Link href="/products">
              <Button size="sm" className="h-10 max-[485px]:h-9 w-10 max-[485px]:w-9 p-0">
                <ArrowLeft className="w-6 h-6 max-[485px]:w-5 max-[485px]:h-5 stroke-[2.5]" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl max-[485px]:text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 max-[485px]:w-4 max-[485px]:h-4" />
                Panier
              </h1>
              {!isEmpty && (
                <p className="text-xs max-[485px]:text-[10px] text-gray-600 mt-0.5 max-[485px]:mt-0">
                  {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''} - {cart.totalPrice.toLocaleString()} FCFA
                </p>
              )}
            </div>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs max-[485px]:text-[10px] h-8 max-[485px]:h-7 w-fit max-[485px]:w-fit"
            >
              <Trash2 className="w-3.5 h-3.5 max-[485px]:w-3 max-[485px]:h-3 mr-1.5 max-[485px]:mr-1" />
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
          <div className="grid  grid-cols-1 lg:grid-cols-3 gap-4 max-[485px]:gap-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className='max-[485px]:border-0'>
                <CardHeader className="p-3 max-[485px]:p-2">
                  <CardTitle className="text-base max-[485px]:text-sm">Articles dans votre panier</CardTitle>
                </CardHeader>
                <CardContent className="p-3 max-[485px]:p-2">
                  <div className="space-y-3 max-[485px]:space-y-2">
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
