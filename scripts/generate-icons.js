const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tailles des icônes à générer
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Chemins - Essayer d'abord le favicon.ico, puis le logo.png comme fallback
const faviconPath = path.join(__dirname, '..', 'app', 'favicon.ico');
const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Déterminer le fichier source à utiliser
let inputPath;
let sourceType = '';

// Essayer d'abord le favicon.ico si spécifié via argument
const useFavicon = process.argv.includes('--favicon') || process.argv.includes('-f');

if (useFavicon && fs.existsSync(faviconPath)) {
  // Pour les fichiers .ico, on essaie de les convertir
  // Note: Sharp peut avoir des problèmes avec les .ico selon la version
  inputPath = faviconPath;
  sourceType = 'favicon.ico';
  console.log('📎 Tentative d\'utilisation du favicon.ico comme source');
} else if (fs.existsSync(faviconPath) && !fs.existsSync(logoPath)) {
  // Si le logo.png n'existe pas, essayer le favicon.ico
  inputPath = faviconPath;
  sourceType = 'favicon.ico';
  console.log('📎 Utilisation du favicon.ico comme source (logo.png non trouvé)');
} else if (fs.existsSync(logoPath)) {
  // Par défaut, utiliser logo.png qui est généralement de meilleure qualité
  inputPath = logoPath;
  sourceType = 'logo.png';
  console.log('✅ Utilisation du logo.png comme source (recommandé pour meilleure qualité)');
} else if (fs.existsSync(faviconPath)) {
  inputPath = faviconPath;
  sourceType = 'favicon.ico';
  console.log('⚠️  Utilisation du favicon.ico comme source (seul fichier disponible)');
} else {
  console.error('❌ Aucun fichier source trouvé (logo.png ou favicon.ico)');
  console.error(`   Cherché dans:`);
  console.error(`   - ${logoPath}`);
  console.error(`   - ${faviconPath}`);
  process.exit(1);
}

// S'assurer que le répertoire de sortie existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('\n' + '='.repeat(50));
console.log('🎨 Génération des icônes PWA');
console.log('='.repeat(50));
console.log(`📁 Source: ${sourceType || path.basename(inputPath)}`);
console.log(`📂 Destination: ${outputDir}`);
console.log(`📏 Tailles: ${sizes.join(', ')} pixels`);
console.log('='.repeat(50) + '\n');

// Vérifier si le fichier source existe (déjà fait ci-dessus, mais double vérification)
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Erreur: Le fichier source ${inputPath} n'existe pas.`);
  process.exit(1);
}

// Générer chaque icône
async function generateIcons() {
  let successCount = 0;
  let errorCount = 0;

  // Obtenir les métadonnées une seule fois au début
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`📐 Format source: ${metadata.format?.toUpperCase() || 'inconnu'}, ${metadata.width}x${metadata.height}px\n`);
  } catch (metaError) {
    console.log(`⚠️  Impossible de lire les métadonnées du fichier source\n`);
  }

  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      // Redimensionner avec un fond transparent si nécessaire
      // Utiliser 'contain' pour maintenir les proportions avec fond transparent
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain', // 'contain' préserve les proportions, 'cover' remplit toute la zone
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fond transparent
        })
        .ensureAlpha() // S'assurer qu'il y a un canal alpha
        .png({
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: size <= 256 // Utiliser une palette pour les petites icônes
        })
        .toFile(outputPath);

      console.log(`   ✅ icon-${size}x${size}.png`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Erreur: icon-${size}x${size}.png - ${error.message}`);
      
      // Si l'erreur est due au format .ico, suggérer une alternative
      if (error.message.includes('unsupported') && inputPath.endsWith('.ico')) {
        console.error(`\n   💡 Les fichiers .ico peuvent ne pas être supportés par Sharp.`);
        console.error(`   💡 Solutions:`);
        console.error(`      1. Utilisez logo.png: npm run generate-icons`);
        console.error(`      2. Convertissez le .ico en PNG manuellement`);
        console.error(`      3. Utilisez un outil en ligne comme https://cloudconvert.com/ico-to-png\n`);
        
        // Si c'est la première erreur et qu'on utilise favicon.ico, essayer logo.png
        if (errorCount === 0 && fs.existsSync(logoPath)) {
          console.log(`\n   🔄 Tentative avec logo.png comme alternative...\n`);
          inputPath = logoPath;
          sourceType = 'logo.png';
          // Réessayer cette taille avec le nouveau fichier source
          try {
            await sharp(inputPath)
              .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
              })
              .ensureAlpha()
              .png({
                quality: 100,
                compressionLevel: 9,
                palette: size <= 256
              })
              .toFile(outputPath);
            console.log(`   ✅ icon-${size}x${size}.png (généré avec logo.png)`);
            successCount++;
            errorCount--; // Annuler l'erreur
          } catch (retryError) {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ ${successCount} icône(s) générée(s) avec succès`);
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erreur(s) rencontrée(s)`);
  }
  console.log('='.repeat(50));
}

// Exécuter
generateIcons().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
