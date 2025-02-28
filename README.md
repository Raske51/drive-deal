# DriveDeal

Une application moderne de recherche et de gestion de véhicules avec des fonctionnalités avancées de sécurité.

## Fonctionnalités

- 🚗 Recherche avancée de véhicules
- 🔒 Authentification sécurisée
- ❤️ Gestion des favoris
- 🔔 Système d'alertes
- 📱 Interface responsive
- 🛡️ Protection contre les attaques
- 📄 Validation des fichiers
- 🔐 Chiffrement des données sensibles

## Technologies

- Next.js 14
- TypeScript
- MongoDB
- AWS S3
- Sentry
- TailwindCSS

## Prérequis

- Node.js 18+
- MongoDB
- AWS Account
- ClamAV (pour la validation des fichiers)

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-username/drive-deal.git
cd drive-deal
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Lancer le serveur de développement
```bash
npm run dev
```

## Déploiement

Le projet est configuré pour un déploiement sur Vercel. Pour déployer :

1. Pusher sur GitHub
2. Connecter le repository à Vercel
3. Configurer les variables d'environnement
4. Déployer

## Sécurité

- Validation des entrées
- Protection CSRF
- Rate limiting
- Scan antivirus des fichiers
- Chiffrement des données sensibles
- Headers de sécurité
- Monitoring avec Sentry

## Licence

MIT
