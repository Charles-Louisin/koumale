'use client';

import { useState, useEffect, useCallback } from 'react';
import { Workbox } from 'workbox-window';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Vérifier le support des notifications push
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Récupérer la clé publique VAPID
  useEffect(() => {
    if (isSupported) {
      axios
        .get(`${API_BASE_URL}/api/push/vapid-key`)
        .then((response) => {
          if (response.data.success) {
            setVapidPublicKey(response.data.publicKey);
          }
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération de la clé VAPID:', error);
        });
    }
  }, [isSupported]);

  // Vérifier si l'utilisateur est déjà abonné
  useEffect(() => {
    if (isSupported && 'serviceWorker' in navigator) {
      checkSubscription();
    }
  }, [isSupported]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription({
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
          }
        });
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
    }
  }, []);

  // Convertir ArrayBuffer en base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convertir base64 en Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Demander la permission et s'abonner
  const subscribe = useCallback(async () => {
    console.log('[Push] Début de l\'abonnement...');
    console.log('[Push] isSupported:', isSupported);
    console.log('[Push] vapidPublicKey:', vapidPublicKey ? 'Présente' : 'Manquante');
    console.log('[Push] permission actuelle:', permission);

    if (!isSupported || !vapidPublicKey) {
      console.error('[Push] Notifications push non supportées ou clé VAPID manquante');
      return false;
    }

    try {
      // Demander la permission si nécessaire
      let currentPermission = permission;
      
      if (currentPermission === 'default') {
        console.log('[Push] Demande de permission à l\'utilisateur...');
        const newPermission = await Notification.requestPermission();
        console.log('[Push] Permission reçue:', newPermission);
        setPermission(newPermission);
        currentPermission = newPermission;
        
        if (newPermission !== 'granted') {
          console.warn('[Push] Permission de notification refusée par l\'utilisateur');
          return false;
        }
      }

      // Vérifier la permission avec la valeur à jour
      if (currentPermission !== 'granted') {
        console.warn('[Push] Permission de notification non accordée:', currentPermission);
        return false;
      }

      console.log('[Push] Permission accordée, récupération du Service Worker...');

      // S'assurer que le service worker est enregistré et prêt
      let registration: ServiceWorkerRegistration;
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        console.log('[Push] Service Worker prêt:', registration.scope);
      } else {
        throw new Error('Service Worker non supporté');
      }

      console.log('[Push] Abonnement aux notifications push...');

      // S'abonner aux notifications push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      console.log('[Push] Abonnement réussi, endpoint:', pushSubscription.endpoint);

      const subscriptionData: PushSubscription = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      console.log('[Push] Envoi de la subscription au serveur...');

      // Enregistrer la subscription sur le serveur
      const response = await axios.post(
        `${API_BASE_URL}/api/push/subscribe`,
        { subscription: subscriptionData },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Inclure les cookies pour l'authentification
        }
      );

      console.log('[Push] Réponse du serveur:', response.data);

      if (response.data.success) {
        console.log('[Push] ✅ Subscription enregistrée avec succès !');
        setSubscription(subscriptionData);
        setIsSubscribed(true);
        return true;
      } else {
        console.error('[Push] ❌ Erreur lors de l\'enregistrement:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('[Push] ❌ Erreur lors de l\'abonnement aux notifications push:', error);
      
      // Si l'erreur est due à une subscription existante, la récupérer
      if (error instanceof Error && error.message.includes('already subscribed')) {
        console.log('[Push] Subscription existante détectée, récupération...');
        await checkSubscription();
        return true;
      }
      
      return false;
    }
  }, [isSupported, vapidPublicKey, permission, checkSubscription]);

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      console.warn('Aucune subscription active');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
        
        // Supprimer la subscription sur le serveur
        await axios.post(
          `${API_BASE_URL}/api/push/unsubscribe`,
          { endpoint: subscription.endpoint },
          {
            withCredentials: true
          }
        );

        setSubscription(null);
        setIsSubscribed(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    checkSubscription
  };
};
