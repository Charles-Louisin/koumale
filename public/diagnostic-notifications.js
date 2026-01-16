/**
 * Script de diagnostic pour les notifications push
 * 
 * Comment l'utiliser en production :
 * 1. Ouvrez votre site en production
 * 2. Ouvrez la console (F12)
 * 3. Copiez-collez tout ce fichier dans la console
 * 4. Les résultats s'afficheront avec des ✅ ou ❌
 */

console.log('🔍 DIAGNOSTIC DES NOTIFICATIONS PUSH\n');
console.log('═'.repeat(50));

// 1. Vérifier le support du navigateur
console.log('\n📱 1. Support du navigateur');
console.log('─'.repeat(50));

if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker : Supporté');
} else {
  console.log('❌ Service Worker : NON supporté');
}

if ('PushManager' in window) {
  console.log('✅ PushManager : Supporté');
} else {
  console.log('❌ PushManager : NON supporté');
}

if ('Notification' in window) {
  console.log('✅ Notifications : Supportées');
  console.log(`   Permission actuelle : ${Notification.permission}`);
} else {
  console.log('❌ Notifications : NON supportées');
}

// 2. Vérifier le Service Worker
console.log('\n🔧 2. État du Service Worker');
console.log('─'.repeat(50));

navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Service Worker enregistré');
    console.log(`   Scope : ${reg.scope}`);
    console.log(`   Active : ${reg.active ? 'Oui' : 'Non'}`);
    console.log(`   Installing : ${reg.installing ? 'Oui' : 'Non'}`);
    console.log(`   Waiting : ${reg.waiting ? 'Oui' : 'Non'}`);
    
    // Vérifier l'abonnement push
    if (reg.pushManager) {
      reg.pushManager.getSubscription().then(sub => {
        console.log('\n📬 3. Abonnement Push');
        console.log('─'.repeat(50));
        if (sub) {
          console.log('✅ Abonnement existant');
          console.log(`   Endpoint : ${sub.endpoint.substring(0, 50)}...`);
        } else {
          console.log('⚠️  Aucun abonnement actif');
        }
      });
    } else {
      console.log('❌ PushManager non disponible sur ce SW');
    }
  } else {
    console.log('❌ Aucun Service Worker enregistré');
  }
});

// 3. Vérifier l'API Backend
console.log('\n🌐 4. Vérification de l\'API Backend');
console.log('─'.repeat(50));

const API_URL = process?.env?.NEXT_PUBLIC_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                  ? 'http://localhost:5000' 
                  : 'https://votre-backend.railway.app');

console.log(`   URL de l'API : ${API_URL}`);

fetch(`${API_URL}/api/push/vapid-key`)
  .then(res => res.json())
  .then(data => {
    if (data.success && data.publicKey) {
      console.log('✅ Clé VAPID récupérée avec succès');
      console.log(`   Clé publique : ${data.publicKey.substring(0, 30)}...`);
    } else {
      console.log('❌ Erreur lors de la récupération de la clé VAPID');
      console.log('   Réponse :', data);
    }
  })
  .catch(err => {
    console.log('❌ Impossible de contacter le backend');
    console.log('   Erreur :', err.message);
    console.log('   Vérifiez que NEXT_PUBLIC_API_URL est correctement configuré');
  });

// 4. Vérifier HTTPS (requis en production)
console.log('\n🔒 5. Sécurité (HTTPS)');
console.log('─'.repeat(50));

if (window.location.protocol === 'https:') {
  console.log('✅ Site en HTTPS');
} else if (window.location.hostname === 'localhost') {
  console.log('⚠️  Site en HTTP (OK pour localhost)');
} else {
  console.log('❌ Site en HTTP (HTTPS requis pour les notifications push en production)');
}

// 5. Instructions
setTimeout(() => {
  console.log('\n💡 INSTRUCTIONS');
  console.log('═'.repeat(50));
  console.log('\nSi tous les tests sont ✅ :');
  console.log('→ Les notifications devraient fonctionner');
  console.log('→ Si elles ne fonctionnent toujours pas, regardez les logs ci-dessus');
  console.log('\nSi vous voyez des ❌ :');
  console.log('→ Service Worker manquant : Rechargez la page (Ctrl+Shift+R)');
  console.log('→ Clé VAPID manquante : Vérifiez les variables d\'environnement du backend');
  console.log('→ Site en HTTP : Déployez en HTTPS (Vercel/Railway le font automatiquement)');
  console.log('\nPour plus d\'aide : Consultez les logs complets ci-dessus\n');
}, 1000);
