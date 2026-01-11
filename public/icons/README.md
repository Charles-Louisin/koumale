# Icônes PWA

Pour une PWA complète, vous devez générer les icônes suivantes à partir du logo KOUMALE (`../images/logo.png`) :

- `icon-72x72.png` (72x72 pixels)
- `icon-96x96.png` (96x96 pixels)
- `icon-128x128.png` (128x128 pixels)
- `icon-144x144.png` (144x144 pixels)
- `icon-152x152.png` (152x152 pixels) - Pour iOS
- `icon-192x192.png` (192x192 pixels) - Minimum requis Android
- `icon-384x384.png` (384x384 pixels)
- `icon-512x512.png` (512x512 pixels) - Recommandé Android

## Outils pour générer les icônes

Vous pouvez utiliser des outils en ligne comme :
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

Ou des outils en ligne de commande comme `sharp` ou `jimp` avec Node.js.

## Exemple avec sharp (Node.js)

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('../images/logo.png')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}x${size}.png`)
    .then(() => console.log(`Created icon-${size}x${size}.png`))
    .catch(err => console.error(err));
});
```

## Note

Pour le moment, les icônes peuvent être des placeholders. Une fois les vraies icônes générées, remplacez-les dans ce dossier.
