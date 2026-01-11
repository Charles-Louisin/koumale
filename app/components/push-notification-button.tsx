'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';

interface PushNotificationButtonProps {
  variant?: 'default' | 'compact' | 'icon-only';
}

export const PushNotificationButton = ({ variant = 'default' }: PushNotificationButtonProps = {}) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isSupported) {
    return null; // Ne rien afficher si les notifications ne sont pas supportées
  }

  const handleToggle = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      if (isSubscribed) {
        const success = await unsubscribe();
        if (success) {
          setMessage('Notifications désactivées');
        } else {
          setMessage('Erreur lors de la désactivation');
        }
      } else {
        if (permission === 'denied') {
          setMessage('Veuillez autoriser les notifications dans les paramètres de votre navigateur');
          setIsLoading(false);
          return;
        }

        const success = await subscribe();
        if (success) {
          setMessage('Notifications activées avec succès !');
        } else {
          if (permission === 'default') {
            setMessage('Permission refusée. Vous pouvez l\'activer dans les paramètres de votre navigateur.');
          } else {
            setMessage('Erreur lors de l\'activation des notifications');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la bascule des notifications:', error);
      setMessage('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Version compacte (icône seule) pour la navbar desktop
  if (variant === 'icon-only' || variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className={`p-2 rounded-lg transition relative ${
          isSubscribed
            ? 'text-primary bg-primary/10 hover:bg-primary/20'
            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
        } ${isLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={
          permission === 'denied'
            ? 'Notifications bloquées'
            : isSubscribed
            ? 'Désactiver les notifications'
            : 'Activer les notifications'
        }
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
        ) : isSubscribed ? (
          <BellOff className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {isSubscribed && variant === 'compact' && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>
    );
  }

  // Version par défaut (complète) pour le menu mobile
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <Button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        variant={isSubscribed ? 'default' : 'outline'}
        className="flex items-center gap-2 w-full justify-start"
        title={
          permission === 'denied'
            ? 'Notifications bloquées dans les paramètres du navigateur'
            : isSubscribed
            ? 'Désactiver les notifications'
            : 'Activer les notifications'
        }
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <span>Chargement...</span>
          </>
        ) : isSubscribed ? (
          <>
            <BellOff className="h-4 w-4" />
            <span>Notifications activées</span>
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            <span>Activer les notifications</span>
          </>
        )}
      </Button>
      {message && (
        <p className={`text-xs ${message.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      {permission === 'denied' && (
        <p className="text-xs text-gray-500 text-left max-w-xs">
          Les notifications sont bloquées. Pour les activer, allez dans les paramètres de votre navigateur.
        </p>
      )}
    </div>
  );
};
