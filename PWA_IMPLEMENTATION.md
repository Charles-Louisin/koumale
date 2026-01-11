# Implémentation PWA et Notifications Push - KOUMALE

## ✅ Ce qui a été implémenté

### 1. Configuration PWA
- ✅ Manifest.json créé avec toutes les icônes nécessaires
- ✅ Configuration Next.js avec `next-pwa`
- ✅ Service Worker automatique (généré par next-pwa)
- ✅ Meta tags PWA dans le layout
- ✅ Support iOS et Android

### 2. Notifications Push
- ✅ Modèle PushSubscription dans MongoDB
- ✅ Service de notifications push avec web-push
- ✅ Routes API pour s'abonner/se désabonner
- ✅ Hook React `usePushNotifications` pour gérer les abonnements
- ✅ Composant `PushNotificationButton` pour activer/désactiver les notifications
- ✅ Gestion des notifications selon les rôles

### 3. Notifications selon les rôles

#### Clients / Non connectés
- ✅ Nouvelle boutique créée → Notification
- ✅ Nouveau produit ajouté → Notification
- ✅ Rappels produits en promotion (cron quotidien à 10h)
- ✅ Rappels produits tendances (cron tous les 2 jours à 14h)
- ✅ Rappels boutiques populaires (cron tous les 3 jours à 16h)

#### Vendeurs
- ✅ Toutes les notifications clients
- ✅ Nouvelle review sur un de leurs produits → Notification
- ✅ Rappel pour publier des produits (cron lundi 9h)
- ✅ Rappel pour mettre des produits en promotion (cron mercredi 11h)

#### Admins
- ✅ Toutes les notifications précédentes
- ✅ Nouvel utilisateur inscrit → Notification
- ✅ Boutique en attente de validation → Notification
- ✅ Rappel boutiques avec peu de produits (cron mardi 10h)
- ✅ Rappel produits avec peu de vues (cron jeudi 10h)

### 4. Tâches programmées (Cron Jobs)
- ✅ Produits promotionnels : Tous les jours à 10h00
- ✅ Produits tendances : Tous les 2 jours à 14h00
- ✅ Boutiques populaires : Tous les 3 jours à 16h00
- ✅ Rappel vendeurs (publier) : Tous les lundis à 9h00
- ✅ Rappel vendeurs (promotions) : Tous les mercredis à 11h00
- ✅ Rappel admins (peu de produits) : Tous les mardis à 10h00
- ✅ Rappel admins (peu de vues) : Tous les jeudis à 10h00

### 5. Intégration dans les Controllers
- ✅ `createProduct` → Notifie les clients du nouveau produit
- ✅ `postProductReview` → Notifie le vendeur du nouveau review
- ✅ `register` → Notifie les admins du nouvel utilisateur
- ✅ `registerVendor` → Notifie les clients et admins du nouveau vendor

## 📋 Étapes pour activer la PWA

### 1. Générer les clés VAPID

```bash
cd backend
npx web-push generate-vapid-keys
```

Cela générera deux clés :
- **Public Key** : À ajouter dans `.env`
- **Private Key** : À ajouter dans `.env` (garder secret)

### 2. Configurer les variables d'environnement

Ajoutez dans `backend/.env` :

```env
VAPID_PUBLIC_KEY=votre_cle_publique_ici
VAPID_PRIVATE_KEY=votre_cle_privee_ici
VAPID_SUBJECT=mailto:contact@koumale.com

```

### 3. Générer les icônes PWA

Les icônes doivent être générées à partir du logo (`public/images/logo.png`) dans les tailles suivantes :

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png` (important pour iOS)
- `icon-192x192.png` (minimum Android)
- `icon-384x384.png`
- `icon-512x512.png` (recommandé Android)

Voir `public/icons/README.md` pour plus de détails.

### 4. Build et déploiement

```bash
# Build de production
npm run build

# Démarrer le backend
cd backend
npm run dev

# Démarrer le frontend
npm start
```

**Important** : Les notifications push nécessitent HTTPS en production.

## 🚀 Utilisation

### Pour les utilisateurs

1. Visiter l'application sur mobile ou desktop
2. Cliquer sur le bouton "Activer les notifications" (à ajouter dans la navbar ou dans les paramètres)
3. Autoriser les notifications dans le navigateur
4. L'application peut maintenant être installée comme PWA

### Sur iOS (16.4+)

1. Ouvrir l'application dans Safari
2. Cliquer sur le bouton "Partager"
3. Sélectionner "Sur l'écran d'accueil"
4. L'application sera installée comme PWA

### Sur Android

1. Ouvrir l'application dans Chrome
2. Un banner "Installer l'application" apparaîtra automatiquement
3. Ou cliquer sur le menu (3 points) → "Installer l'application"

## 🔧 Utilisation du composant PushNotificationButton

Ajoutez le composant dans n'importe quelle page :

```tsx
import { PushNotificationButton } from '@/app/components/push-notification-button';

export default function MyPage() {
  return (
    <div>
      <PushNotificationButton />
    </div>
  );
}
```

## 📝 Notes importantes

1. **HTTPS requis** : Les notifications push nécessitent HTTPS en production
2. **Icônes manquantes** : Les icônes doivent être générées pour que la PWA fonctionne complètement
3. **Service Worker** : Généré automatiquement par next-pwa lors du build
4. **Test en développement** : Les notifications push fonctionnent aussi en localhost avec Chrome

## 🐛 Dépannage

### Les notifications ne s'affichent pas
- Vérifier que les clés VAPID sont correctement configurées
- Vérifier que le service worker est enregistré (Console du navigateur)
- Vérifier que les permissions de notification sont accordées

### La PWA ne s'installe pas
- Vérifier que le manifest.json est accessible
- Vérifier que les icônes sont présentes
- Vérifier que l'application est servie en HTTPS (ou localhost)

### Erreurs de build
- Vérifier que `next-pwa` est installé
- Vérifier que `next.config.ts` est correctement configuré
- Vérifier les types TypeScript avec `npm run lint`

## 📚 Documentation supplémentaire

- `backend/PWA_SETUP.md` : Documentation détaillée sur la configuration VAPID
- `public/icons/README.md` : Guide pour générer les icônes PWA
