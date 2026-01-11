// Service Worker personnalisé pour gérer les notifications push
// Ce fichier sera mergé avec le service worker généré par next-pwa

// Écouter les événements push (notifications reçues)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push reçu:', event);
  
  let notificationData = {
    title: 'KOUMALE',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'default',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parser les données de la notification si elles existent
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || payload.type || notificationData.tag,
        requireInteraction: payload.requireInteraction !== undefined ? payload.requireInteraction : notificationData.requireInteraction,
        data: {
          ...notificationData.data,
          ...payload.data,
          url: payload.data?.url || payload.url || notificationData.data.url
        }
      };
    } catch (e) {
      console.error('[Service Worker] Erreur lors du parsing de la payload push:', e);
      // Si le parsing échoue, essayer de convertir en texte
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Options de notification avec actions
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200], // Vibration pour les appareils supportés
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ],
    timestamp: notificationData.data.timestamp || Date.now()
  };

  // Afficher la notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification cliquée:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/';

  // Si l'utilisateur clique sur "Fermer", ne rien faire
  if (action === 'close') {
    console.log('[Service Worker] Notification fermée');
    return;
  }

  // Sinon, ouvrir ou focus sur l'application
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(function(clientList) {
        // Construire l'URL complète
        const fullUrl = self.location.origin + urlToOpen;
        
        // Vérifier s'il y a déjà une fenêtre ouverte avec cette URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(fullUrl);
          
          // Comparer les chemins (ignore le hash et les query params pour la comparaison)
          if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
            console.log('[Service Worker] Focus sur la fenêtre existante:', fullUrl);
            return client.focus();
          }
        }
        
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        if (clients.openWindow) {
          console.log('[Service Worker] Ouverture d\'une nouvelle fenêtre:', fullUrl);
          return clients.openWindow(fullUrl);
        }
      })
      .catch(function(error) {
        console.error('[Service Worker] Erreur lors de l\'ouverture de la fenêtre:', error);
        // En cas d'erreur, essayer d'ouvrir la page d'accueil
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin);
        }
      })
  );
});

// Gérer la fermeture des notifications
self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification fermée par l\'utilisateur:', event.notification.tag);
  // Ici, vous pourriez envoyer un événement analytics ou autre
});
