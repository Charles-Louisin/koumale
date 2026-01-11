'use client';

import { useEffect } from 'react';

export const PWAProvider = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // next-pwa enregistre automatiquement le service worker
      // On gère juste les événements de notifications ici
      
      // Gérer les clics sur les notifications
      navigator.serviceWorker.addEventListener('notificationclick', (event) => {
        event.notification.close();

        const action = event.action;
        const data = event.notification.data as { url?: string } | undefined;

        if (action === 'close') {
          return;
        }

        // Ouvrir ou focus sur l'application
        const urlToOpen = data?.url || '/';
        
        event.waitUntil(
          clients
            .matchAll({
              type: 'window',
              includeUncontrolled: true
            })
            .then((clientList) => {
              // Vérifier s'il y a déjà une fenêtre ouverte
              for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                  return (client as WindowClient).focus();
                }
              }
              // Sinon, ouvrir une nouvelle fenêtre
              if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
              }
            })
        );
      });
    }
  }, []);

  return null;
};
