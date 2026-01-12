# Configuration Vercel pour next-pwa

## Problème
Next.js 16 utilise Turbopack par défaut, mais `next-pwa` nécessite Webpack.

## Solution pour Vercel

**Option 1 : Variable d'environnement (Recommandé)**

Dans les paramètres Vercel :
1. Allez dans **Settings > Environment Variables**
2. Ajoutez une nouvelle variable :
   - **Name**: `NEXT_PRIVATE_SKIP_TURBO`
   - **Value**: `1`
   - **Environment**: Production, Preview, Development
3. Redéployez votre application

**Option 2 : Script de build personnalisé**

Si l'option 1 ne fonctionne pas, utilisez le script `scripts/build.js` qui définit automatiquement la variable.

**Option 3 : Downgrade Next.js (si nécessaire)**

Si les options précédentes ne fonctionnent pas, vous pouvez temporairement utiliser Next.js 15 :
```bash
npm install next@15
```

## Note
Vercel devrait normalement détecter automatiquement `next-pwa` et utiliser Webpack, mais avec Next.js 16, il faut parfois forcer explicitement.
