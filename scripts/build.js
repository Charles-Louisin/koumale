// Script de build pour Vercel - Force l'utilisation de Webpack
const { execSync } = require('child_process');

// Forcer l'utilisation de Webpack en définissant la variable d'environnement
process.env.NEXT_PRIVATE_SKIP_TURBO = '1';
process.env.NEXT_PRIVATE_DISABLE_TURBO = '1';

// Exécuter le build
try {
  execSync('next build', { 
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Erreur lors du build:', error);
  process.exit(1);
}
