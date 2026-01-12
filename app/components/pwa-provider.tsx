'use client';

import { useEffect } from 'react';

// Types pour les événements Service Worker
interface NotificationClickEvent extends Event {
  notification: Notification;
  action?: string;
  waitUntil(promise: Promise<any>): void;
}

declare global {
  interface ServiceWorkerGlobalScope {
    clients: Clients;
  }
  
  interface Clients {
    matchAll(options?: ClientQueryOptions): Promise<Client[]>;
    openWindow(url: string): Promise<WindowClient | null>;
  }
  
  interface Client {
    url: string;
    id: string;
    type: string;
    postMessage(message: any): void;
  }
  
  interface WindowClient extends Client {
    focus(): Promise<WindowClient>;
    navigate(url: string): Promise<WindowClient>;
  }
  
  interface ClientQueryOptions {
    type?: 'window' | 'worker' | 'sharedworker' | 'all';
    includeUncontrolled?: boolean;
  }
}

export const PWAProvider = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // next-pwa enregistre automatiquement le service worker
      // On gère juste les événements de notifications ici
      
      // Gérer les clics sur les notifications
      navigator.serviceWorker.addEventListener('notificationclick', (event: Event) => {
        const notificationEvent = event as unknown as NotificationClickEvent;
        notificationEvent.notification.close();

        const action = notificationEvent.action;
        const data = notificationEvent.notification.data as { url?: string } | undefined;

        if (action === 'close') {
          return;
        }

        // Ouvrir ou focus sur l'application
        const urlToOpen = data?.url || '/';
        
        notificationEvent.waitUntil(
          (self as any).clients
            .matchAll({
              type: 'window',
              includeUncontrolled: true
            })
            .then((clientList: Client[]) => {
              // Vérifier s'il y a déjà une fenêtre ouverte
              for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                  return (client as WindowClient).focus();
                }
              }
              // Sinon, ouvrir une nouvelle fenêtre
              if ((self as any).clients.openWindow) {
                return (self as any).clients.openWindow(urlToOpen);
              }
            })
            .catch((error: Error) => {
              console.error('Erreur lors de l\'ouverture de la fenêtre:', error);
            })
        );
      });
    }
  }, []);

  return null;
};
