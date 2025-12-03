# TODO - Correction Google Login Toast

## Description
Corriger l'affichage du nom et prénom dans le toast après connexion Google. Actuellement, seul "Bienvenue..." s'affiche au lieu de "Bienvenue [Prénom] [Nom]".

## Problème
- Le token JWT ne contient que l'ID utilisateur
- AuthCallbackPage.tsx essaie d'extraire firstName/lastName du token (qui n'y sont pas)
- Solution : utiliser authApi.getMe() pour récupérer les infos utilisateur après avoir défini le token

## Tâches
- [ ] Modifier AuthCallbackPage.tsx pour utiliser authApi.getMe() au lieu d'extraire du token
- [ ] Tester la connexion Google pour vérifier que le toast affiche correctement le nom

## État
En cours
