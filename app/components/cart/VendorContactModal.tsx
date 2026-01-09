"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/modal';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MessageCircle, MapPin, User, ShoppingCartIcon, LucideShoppingBag } from 'lucide-react';
import { useCart, Cart } from '@/app/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { authStorage, authApi } from '@/app/lib/api';
import { useToast } from '@/app/hooks/use-toast';
import { SecurityWarningModal } from '@/app/components/ui/security-warning-modal';

interface VendorContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
}

export default function VendorContactModal({ isOpen, onClose, cart }: VendorContactModalProps) {
  const { isAuthenticated } = useCart();
  const router = useRouter();
  const { error: showError } = useToast();
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [hideSecurityWarning, setHideSecurityWarning] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [pendingContactAction, setPendingContactAction] = useState<(() => void) | null>(null);

  // Récupérer l'utilisateur connecté et précharger son nom quand le modal s'ouvre
  useEffect(() => {
    if (!isOpen) return; // Ne rien faire si le modal n'est pas ouvert
    
    const token = authStorage.getToken();
    if (token && isAuthenticated) {
      authApi
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            const fullName = `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim();
            if (fullName) {
              setClientName((prev) => prev || fullName); // Ne remplir que si le champ est vide
            }
            setHideSecurityWarning(res.user.hideSecurityWarning || false);
          }
        })
        .catch(() => {
          // Silently fail if user fetch fails
        });
    }
  }, [isAuthenticated, isOpen]);

  if (!cart || !cart.items || cart.items.length === 0) {
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

  const executeContactVendor = (vendor: any, vendorItems: any[]) => {
    // Format phone number (remove spaces, +, etc.)
    const phone = vendor.whatsappLink?.replace(/\D/g, '') || '';
    
    // Build message
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

    if (clientName) {
      message += `👤 Nom: ${clientName}\n`;
    }
    if (clientAddress) {
      message += `📍 Adresse de livraison: ${clientAddress}\n\n`;
    }

    message += `Pouvez-vous me confirmer la disponibilité et les détails de livraison ?\n`;
    message += `Merci !`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContactVendor = (vendor: any, vendorItems: any[]) => {
    // Check if user is authenticated
    if (!isAuthenticated || !authStorage.getToken()) {
      showError('Vous devez être connecté pour contacter les vendeurs', 4000);
      onClose();
      setTimeout(() => {
        router.push('/auth/login?redirect=/cart');
      }, 500);
      return;
    }

    // Si l'utilisateur a choisi de ne plus voir l'avertissement, contacter directement
    if (hideSecurityWarning) {
      executeContactVendor(vendor, vendorItems);
      return;
    }

    // Sinon, afficher le modal d'avertissement
    setPendingContactAction(() => () => {
      executeContactVendor(vendor, vendorItems);
    });
    setShowSecurityWarning(true);
  };

  const handleSecurityWarningContinue = () => {
    if (pendingContactAction) {
      pendingContactAction();
      setPendingContactAction(null);
    }
  };

  const handleDontShowAgain = async (checked: boolean) => {
    if (checked) {
      try {
        await authApi.updatePreferences({ hideSecurityWarning: true });
        setHideSecurityWarning(true);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des préférences:', error);
      }
    }
  };

  const handleContactAllVendors = () => {
    Object.values(vendorGroups).forEach((group) => {
      setTimeout(() => {
        handleContactVendor(group.vendor, group.items);
      }, 500); // Small delay to avoid blocking
    });
    onClose();
  };

  const isFormValid = clientName.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Client Information Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
            <User className="w-5 h-5" />
            <span>Vos informations</span>
          </div>

          <div>
            <Label htmlFor="clientName">Nom complet *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Votre nom complet"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="clientAddress">Adresse de livraison</Label>
            <Textarea
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Votre adresse complète pour la livraison (optionnel)"
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluez le quartier, la ville et toute indication utile pour la livraison
            </p>
          </div>
        </div>

        {/* Vendors List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <LucideShoppingBag className="w-5 h-5" />
            <span>Vendeurs ({Object.keys(vendorGroups).length})</span>
          </div>

          {Object.values(vendorGroups).map((group) => (
            <Card key={group.vendor._id} className="shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{group.vendor.businessName}</h3>
                  <Badge variant="secondary">
                    {group.itemCount} article{group.itemCount > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  {group.items.map((item) => {
                    // Vérifier que le produit existe
                    if (!item.product) return null;
                    
                    return (
                      <div key={item._id} className="text-sm flex justify-between">
                        <span className="flex-1 mr-2">
                          {item.quantity}x {item.product.name}
                          {item.note && (
                            <span className="text-gray-500 ml-2">({item.note})</span>
                          )}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {((item.product.promotionalPrice || item.product.price) * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold mb-3">
                <div className='flex itms-center gap-1'>
              <span>Total</span>
              <p className='text-gray-600'>"{group.vendor.businessName}" :</p>
              </div>
                  <span>{group.total.toLocaleString()} FCFA</span>
                </div>

                <Button
                  onClick={() => handleContactVendor(group.vendor, group.items)}
                  className="w-full bg-green-400! hover:bg-green-500! text-white! font-bold! border-0! flex gap-1"
                  disabled={!isFormValid}
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                  <span>"{group.vendor.businessName}"</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </div>

      {/* Security Warning Modal */}
      <SecurityWarningModal
        isOpen={showSecurityWarning}
        onClose={() => {
          setShowSecurityWarning(false);
          setPendingContactAction(null);
        }}
        onContinue={handleSecurityWarningContinue}
        showCheckbox={true}
        onDontShowAgain={handleDontShowAgain}
      />
    </Modal>
  );
}

