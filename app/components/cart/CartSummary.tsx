"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MessageCircle, Phone, ExternalLink, ShoppingCart, Send } from 'lucide-react';
import { useCart, Cart } from '@/app/contexts/CartContext';
import { authStorage } from '@/app/lib/api';
import { useToast } from '@/app/hooks/use-toast';

interface CartSummaryProps {
  onContactVendors: () => void;
}

export default function CartSummary({ onContactVendors }: CartSummaryProps) {
  const { cart, isAuthenticated } = useCart();
  const router = useRouter();
  const { error: showError } = useToast();

  if (!cart || cart.items.length === 0) {
    return null;
  }

  // Group items by vendor
  const vendorGroups = cart.items.reduce((groups, item) => {
    // Vérifier que le produit existe
    if (!item.product) return groups;
    
    const vendorId = item.product?.vendor?._id;
    if (!vendorId) return groups;
    
    if (!groups[vendorId]) {
      groups[vendorId] = {
        vendor: item.product.vendor,
        items: [],
        total: 0,
        itemCount: 0,
      };
    }
    groups[vendorId].items.push(item);
    const price = item.product.promotionalPrice || item.product.price;
    groups[vendorId].total += price * item.quantity;
    groups[vendorId].itemCount += item.quantity;
    return groups;
  }, {} as Record<string, { vendor: any; items: any[]; total: number; itemCount: number }>);

  const handleWhatsAppContact = (vendor: any) => {
    // Check if user is authenticated
    if (!isAuthenticated || !authStorage.getToken()) {
      showError('Vous devez être connecté pour contacter les vendeurs', 4000);
      setTimeout(() => {
        router.push('/auth/login?redirect=/cart');
      }, 500);
      return;
    }

    const vendorItems = vendorGroups[vendor._id].items;
    const phone = vendor.contactPhone?.replace(/\D/g, '') || '';
    
    let message = `Bonjour ${vendor.businessName} ! 👋\n\n`;
    message += `Je souhaite commander les produits suivants :\n\n`;
    
    vendorItems.forEach((item, index) => {
      // Vérifier que le produit existe
      if (!item.product) return;
      
      const price = item.product.promotionalPrice || item.product.price;
      message += `${index + 1}. ${item.quantity}x ${item.product.name}\n`;
      message += `   Prix unitaire: ${price.toLocaleString()} FCFA\n`;
      message += `   Sous-total: ${(price * item.quantity).toLocaleString()} FCFA\n`;
      if (item.note) {
        message += `   Note: ${item.note}\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Total: ${vendorGroups[vendor._id].total.toLocaleString()} FCFA\n`;
    message += `Nombre d'articles: ${vendorGroups[vendor._id].itemCount}\n\n`;
    message += `Pouvez-vous me confirmer la disponibilité et les détails de livraison ?\n\n`;
    message += `Merci ! 🙏`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleTelegramContact = (telegramLink: string) => {
    window.open(telegramLink, '_blank');
  };

  return (
    <Card className="sticky border-0 shadow-sm top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Récapitulatif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vendor Groups */}
        {Object.values(vendorGroups).map((group) => (
          <div key={group.vendor._id} className="shadow-lg rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{group.vendor.businessName}</h3>
              <Badge variant="secondary">
                {group.itemCount} article{group.itemCount > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {group.items.map((item) => {
                // Vérifier que le produit existe
                if (!item.product) return null;
                
                return (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="truncate flex-1 mr-2">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {((item.product.promotionalPrice || item.product.price) * item.quantity).toLocaleString()} FCFA
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vendor Total */}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <div className='flex itms-center gap-1'>
              <span>Total</span>
              <p className='text-gray-600'>"{group.vendor.businessName}" :</p>
              </div>
              <span>{group.total.toLocaleString()} FCFA</span>
            </div>

          </div>
        ))}

        {/* Overall Total */}
        <div className="pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total général:</span>
            <span>{cart.totalPrice.toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Contact All Vendors Button */}
        
          <Button
            onClick={onContactVendors}
            className="w-full"
            size="sm"
          >
            PASSER LA COMMANDE
          </Button>
      </CardContent>
    </Card>
  );
}
