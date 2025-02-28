# DriveDeal API

API REST pour le projet DriveDeal - Agrégateur d'annonces de voitures d'occasion.

## Description

Cette API permet d'accéder aux données des annonces de voitures d'occasion collectées par les scrapers. Elle offre des fonctionnalités de recherche, de filtrage, de statistiques et d'alertes.

## Fonctionnalités

- **Annonces** : Consultation des annonces de voitures avec filtres avancés
- **Recherche** : Recherche d'annonces avec de nombreux critères
- **Statistiques** : Statistiques sur le marché, les marques, les modèles
- **Authentification** : Gestion des utilisateurs et authentification JWT
- **Favoris** : Gestion des annonces favorites
- **Alertes** : Création et gestion d'alertes personnalisées
- **Administration** : Interface d'administration pour les administrateurs

## Technologies utilisées

- **FastAPI** : Framework web rapide pour la création d'API REST
- **MongoDB** : Base de données NoSQL pour le stockage des données
- **Motor** : Client MongoDB asynchrone pour Python
- **Pydantic** : Validation des données et sérialisation
- **JWT** : Authentification basée sur les tokens
- **Uvicorn** : Serveur ASGI pour l'exécution de l'application

## Installation

### Prérequis

- Python 3.10+
- MongoDB 4.4+

### Installation des dépendances

```bash
pip install -r requirements.txt
```

### Configuration

Créez un fichier `.env` à la racine du projet avec les variables d'environnement suivantes :

```
# API
API_V1_STR=/api/v1
PROJECT_NAME=DriveDeal API
VERSION=1.0.0

# Sécurité
SECRET_KEY=votre_clé_secrète_très_longue_et_aléatoire
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Base de données
MONGODB_URL=mongodb://localhost:27017
MONGODB_NAME=drivedeal

# Email (optionnel)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASSWORD=password
EMAILS_FROM_EMAIL=info@drivedeal.com
EMAILS_FROM_NAME=DriveDeal

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/api.log
```

## Utilisation

### Démarrage du serveur

```bash
cd scrapers
python -m api.main
```

Le serveur sera accessible à l'adresse http://localhost:8000.

### Documentation de l'API

La documentation interactive de l'API est disponible aux adresses suivantes :

- Swagger UI : http://localhost:8000/api/v1/docs
- ReDoc : http://localhost:8000/api/v1/redoc

## Structure du projet

```
api/
├── main.py              # Point d'entrée de l'application
├── config.py            # Configuration de l'application
├── dependencies.py      # Dépendances pour l'injection
├── models/              # Modèles de données Pydantic
│   ├── __init__.py
│   ├── car.py           # Modèles pour les annonces
│   ├── search.py        # Modèles pour la recherche
│   ├── stats.py         # Modèles pour les statistiques
│   ├── auth.py          # Modèles pour l'authentification
│   └── alerts.py        # Modèles pour les alertes et favoris
├── routers/             # Routeurs FastAPI
│   ├── __init__.py
│   ├── cars.py          # Routes pour les annonces
│   ├── search.py        # Routes pour la recherche
│   ├── stats.py         # Routes pour les statistiques
│   ├── auth.py          # Routes pour l'authentification
│   ├── favorites.py     # Routes pour les favoris
│   ├── alerts.py        # Routes pour les alertes
│   └── admin.py         # Routes pour l'administration
├── services/            # Services métier
│   ├── __init__.py
│   ├── car_service.py
│   ├── search_service.py
│   ├── stats_service.py
│   ├── auth_service.py
│   ├── favorites_service.py
│   ├── alerts_service.py
│   └── admin_service.py
└── static/              # Fichiers statiques
```

## Endpoints principaux

### Annonces

- `GET /api/v1/cars/` : Liste des annonces avec filtres
- `GET /api/v1/cars/{car_id}` : Détails d'une annonce
- `GET /api/v1/cars/brands/` : Liste des marques disponibles
- `GET /api/v1/cars/brands/{brand}/models` : Liste des modèles pour une marque

### Recherche

- `POST /api/v1/search/` : Recherche d'annonces avec critères avancés
- `GET /api/v1/search/history` : Historique de recherche
- `GET /api/v1/search/saved` : Recherches sauvegardées
- `GET /api/v1/search/suggestions` : Suggestions de recherche

### Statistiques

- `GET /api/v1/stats/market` : Statistiques globales du marché
- `GET /api/v1/stats/brands/{brand}` : Statistiques pour une marque
- `GET /api/v1/stats/models/{brand}/{model}` : Statistiques pour un modèle
- `GET /api/v1/stats/price-analysis/{car_id}` : Analyse de prix pour une annonce

### Authentification

- `POST /api/v1/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/v1/auth/login` : Connexion d'un utilisateur
- `POST /api/v1/auth/refresh-token` : Rafraîchissement d'un token
- `GET /api/v1/auth/me` : Informations sur l'utilisateur connecté

### Favoris

- `GET /api/v1/favorites/` : Liste des favoris
- `POST /api/v1/favorites/` : Ajout d'un favori
- `DELETE /api/v1/favorites/{favorite_id}` : Suppression d'un favori

### Alertes

- `GET /api/v1/alerts/` : Liste des alertes
- `POST /api/v1/alerts/` : Création d'une alerte
- `GET /api/v1/alerts/notifications/` : Liste des notifications

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails. 