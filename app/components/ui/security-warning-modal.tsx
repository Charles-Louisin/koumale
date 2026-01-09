"use client";

import React, { useState } from 'react';
import { Modal } from '@/app/components/ui/modal';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';

interface SecurityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  showCheckbox?: boolean;
  onDontShowAgain?: (checked: boolean) => void;
}

export function SecurityWarningModal({
  isOpen,
  onClose,
  onContinue,
  showCheckbox = false,
  onDontShowAgain
}: SecurityWarningModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (showCheckbox && onDontShowAgain) {
      onDontShowAgain(dontShowAgain);
    }
    onContinue();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="space-y-6">

        {/* Contenu principal */}
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Avant de contacter un vendeur ou de procéder à un achat, veuillez prendre en compte les recommandations de sécurité suivantes :
          </p>

          {/* Recommandations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Vérifiez le vendeur</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-2">
                  <li>Méfiez-vous des prix trop attractifs ou suspects</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">Privilégiez les transactions sécurisées</h4>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside ml-2">
                  <li>Rencontrez le vendeur dans un lieu public et sûr</li>
                  <li>Préférez les rendez-vous en journée</li>
                  <li>Vérifiez le produit avant de payer</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Signaux d'alerte à éviter</h4>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside ml-2">
                  <li>Paiement intégral avant réception du produit</li>
                  <li>Demande de transfert d'argent sans garantie</li>
                  <li>Pression pour conclure rapidement la transaction</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conseils supplémentaires */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 font-medium mb-2">💡 Conseils supplémentaires :</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>En cas de doute, n'hésitez pas à annuler la transaction</li>
              <li>Signalez tout comportement suspect à l'équipe KOUMALE via WhatsApp (+237 682601458)</li>
            </ul>
          </div>
        </div>

        {/* Checkbox pour ne plus afficher */}
        {showCheckbox && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <Label htmlFor="dontShowAgain" className="text-sm text-gray-700 cursor-pointer">
              Ne plus afficher ce message
            </Label>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
            J'ai compris, continuer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
