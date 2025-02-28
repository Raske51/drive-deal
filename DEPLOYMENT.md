# Guide de Déploiement de DriveDeal sur Cloudflare Pages

Ce document fournit les instructions détaillées pour déployer l'application DriveDeal sur Cloudflare Pages.

## Prérequis

- Un compte Cloudflare
- Un repository GitHub connecté à Cloudflare Pages
- Les secrets GitHub configurés pour le déploiement automatique

## Configuration des Secrets GitHub

Pour permettre le déploiement automatique via GitHub Actions, vous devez configurer les secrets suivants dans votre repository GitHub :

1. `CF_API_TOKEN` : Un token API Cloudflare avec les permissions pour déployer sur Pages
2. `CF_ACCOUNT_ID` : L'ID de votre compte Cloudflare

Pour créer un token API Cloudflare :
1. Connectez-vous à votre tableau de bord Cloudflare
2. Allez dans "My Profile" > "API Tokens"
3. Cliquez sur "Create Token"
4. Utilisez le modèle "Edit Cloudflare Workers" et ajoutez les permissions pour Pages

## Configuration sur Cloudflare Pages

### Étape 1 : Connecter votre repository

1. Dans le tableau de bord Cloudflare, allez dans "Pages"
2. Cliquez sur "Create a project"
3. Sélectionnez "Connect to Git"
4. Choisissez votre repository GitHub "drive-deal"

### Étape 2 : Configurer les paramètres de build

| Paramètre | Valeur |
|-----------|--------|
| Framework | Next.js |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | 18.x |

### Étape 3 : Configurer les variables d'environnement

Dans l'onglet "Settings" > "Environment variables", ajoutez les variables suivantes :

- `NEXT_PUBLIC_API_URL` : `https://drive-deal-api.anthonydu51170.workers.dev`
- `NODE_ENV` : `production`
- `JWT_SECRET` : `votre-secret-jwt-sécurisé`

## Déploiement manuel

Si vous souhaitez déployer manuellement l'application :

```bash
# Installer les dépendances
npm install

# Construire l'application
npm run build

# Déployer sur Cloudflare Pages
npx wrangler pages deploy dist
```

## Vérification du déploiement

Après le déploiement, votre application sera disponible à l'adresse :
`https://drive-deal.pages.dev`

Pour utiliser un domaine personnalisé :
1. Dans le tableau de bord Cloudflare Pages, allez dans "Custom domains"
2. Ajoutez votre domaine personnalisé (par exemple, `www.drive-deal.com`)
3. Suivez les instructions pour configurer les enregistrements DNS

## Dépannage

Si vous rencontrez des problèmes lors du déploiement :

1. Vérifiez les logs de build dans le tableau de bord Cloudflare Pages
2. Assurez-vous que toutes les variables d'environnement sont correctement configurées
3. Vérifiez que le fichier `_routes.json` est correctement configuré dans le dossier `dist` 