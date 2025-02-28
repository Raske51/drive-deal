# Guide d'utilisation du script de déploiement automatisé

Ce document explique comment utiliser le script de déploiement automatisé `deploy.js` pour appliquer les correctifs d'alignement et d'espacement sur votre site DriveDeal.

## Prérequis

- Node.js installé sur votre machine (version 12 ou supérieure)
- Accès à un terminal ou une ligne de commande
- Projet DriveDeal avec les fichiers de correctifs déjà créés:
  - `styles/alignment-fixes.css`
  - `styles/listings-fixes.css`

## Installation

1. Placez le fichier `deploy.js` à la racine de votre projet DriveDeal.

2. Rendez le script exécutable (uniquement pour Linux/Mac):
   ```bash
   chmod +x deploy.js
   ```

## Utilisation

### Lancement du script

1. Ouvrez un terminal à la racine de votre projet DriveDeal.

2. Exécutez le script:
   ```bash
   # Sur Windows
   node deploy.js
   
   # Sur Linux/Mac
   ./deploy.js
   ```

### Étapes du processus

Le script vous guidera à travers les étapes suivantes:

1. **Vérification de l'environnement**
   - Vérifie que vous êtes dans un projet Next.js valide

2. **Création des sauvegardes**
   - Vous propose de créer une branche Git ou des sauvegardes de fichiers

3. **Vérification des fichiers CSS**
   - S'assure que les fichiers de correctifs sont présents

4. **Mise à jour de _app.js**
   - Ajoute automatiquement les imports CSS nécessaires

5. **Mise à jour des fichiers de listings**
   - Recherche et modifie les fichiers de la page des listings
   - Ajoute les classes CSS nécessaires pour les correctifs

6. **Construction et déploiement**
   - Vous propose différentes méthodes de déploiement:
     - Via Git (commit, merge et push)
     - Build manuel (npm run build)
     - Ignorer le déploiement

### Options interactives

Le script vous posera plusieurs questions pendant son exécution:

- **Sauvegarde**: Voulez-vous créer une branche Git pour les modifications?
- **Fichier de listings**: Si le fichier n'est pas trouvé automatiquement, vous pouvez spécifier son chemin
- **Confirmation de modification**: Avant de modifier les fichiers, le script demande votre confirmation
- **Méthode de déploiement**: Choix entre Git, build manuel ou ignorer le déploiement
- **Options Git**: Si vous choisissez Git, options pour fusionner et pousser les changements

## Exemple d'utilisation

```
🚀 Démarrage du déploiement automatisé des correctifs DriveDeal

🔍 Vérification de l'environnement...
✅ Environnement valide

💾 Création des sauvegardes...
Voulez-vous créer une branche Git pour les modifications? (O/n): O
✅ Branche Git 'fix/spacing-alignment' créée

🔍 Vérification des fichiers CSS...
✅ Fichiers CSS vérifiés

🔄 Mise à jour de _app.js...
✅ pages/_app.js mis à jour avec les imports CSS

🔍 Recherche des fichiers de listings...
🔄 Mise à jour du fichier de listings: pages/listings.js
Le fichier de listings doit être mis à jour. Voulez-vous procéder? (O/n): O
✅ pages/listings.js mis à jour avec les classes CSS nécessaires

🏗️ Préparation du déploiement...
Choisissez la méthode de déploiement:
1. Git (push vers un dépôt distant)
2. Build manuel (npm run build)
3. Ignorer le déploiement
Votre choix (1-3): 1

🔄 Déploiement via Git...
[output de git add/commit]
Voulez-vous fusionner avec la branche principale? (O/n): O
Nom de la branche principale (main/master): main
[output de git checkout/merge]
Voulez-vous pousser les changements vers le dépôt distant? (O/n): O
[output de git push]
✅ Changements poussés vers le dépôt distant

✅ Déploiement terminé avec succès!

📋 Prochaines étapes recommandées:
1. Vérifiez le site en production
2. Testez sur différents appareils et navigateurs
3. Surveillez les performances avec Lighthouse ou PageSpeed Insights
```

## Résolution des problèmes

### Le script échoue lors de la vérification de l'environnement

- Assurez-vous d'exécuter le script à la racine de votre projet Next.js
- Vérifiez que votre package.json contient bien next dans les dépendances

### Le script ne trouve pas les fichiers CSS

- Vérifiez que les fichiers `styles/alignment-fixes.css` et `styles/listings-fixes.css` existent
- Si vous avez placé ces fichiers ailleurs, modifiez la configuration au début du script

### Le script ne trouve pas le fichier de listings

- Lorsque le script vous demande le chemin, entrez le chemin correct vers votre fichier de listings
- Si vous ne connaissez pas le chemin, vous pouvez taper "skip" pour ignorer cette étape

### Les modifications ne sont pas appliquées correctement

- Consultez les sauvegardes dans le dossier `.backup` ou dans la branche Git précédente
- Suivez les instructions manuelles dans le guide de déploiement (`DEPLOYMENT-GUIDE.md`)

## Support

Si vous rencontrez des problèmes avec le script de déploiement, consultez la documentation ou contactez l'équipe de développement. 