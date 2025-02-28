# État du Projet DriveDeal

## Résumé du Projet

DriveDeal est un agrégateur d'annonces de voitures d'occasion qui collecte des données depuis plusieurs sources (LaCentrale, LeBonCoin, LeParking, AutoScout24) et les présente via une API REST. Le projet comprend deux composants principaux :

1. **Scrapers** : Modules pour extraire les données d'annonces depuis différentes sources
2. **API** : Interface REST pour accéder aux données collectées

## État d'Avancement

### Scrapers
- [x] Restructuration du code en modules spécifiques
- [x] Implémentation du scraper pour LaCentrale
- [x] Implémentation du scraper pour LeBonCoin
- [x] Implémentation du scraper pour LeParking
- [x] Implémentation du scraper pour AutoScout24
- [x] Système de configuration centralisé
- [x] Gestion des données (stockage JSON/DB)
- [x] Gestion des erreurs et mécanismes de reprise
- [x] Tests unitaires

### API
- [x] Structure de base de l'API FastAPI
- [x] Modèles de données (Pydantic)
- [x] Routes pour les annonces de voitures
- [x] Routes pour la recherche
- [x] Routes pour les statistiques
- [x] Routes pour l'authentification
- [x] Routes pour les favoris
- [x] Routes pour les alertes
- [x] Routes pour l'administration
- [x] Fichiers statiques (HTML, CSS, JS)
- [ ] Implémentation complète des services
- [ ] Tests unitaires pour l'API
- [ ] Documentation complète de l'API

## Prochaines Étapes

### Court terme
1. Compléter l'implémentation des services de l'API
2. Ajouter des tests unitaires pour l'API
3. Finaliser la documentation de l'API
4. Configurer la base de données MongoDB

### Moyen terme
1. Développer une interface utilisateur web
2. Implémenter un système d'analyse de prix
3. Ajouter des fonctionnalités de notification par email
4. Optimiser les performances des scrapers

### Long terme
1. Ajouter de nouvelles sources de données
2. Développer une application mobile
3. Implémenter des fonctionnalités d'IA pour la détection de bonnes affaires
4. Mettre en place un système de recommandation personnalisé

## Comment Reprendre le Projet

### Configuration de l'Environnement
1. Cloner le dépôt
2. Installer les dépendances :
   ```
   cd scrapers
   pip install -r requirements.txt
   cd api
   pip install -r requirements.txt
   ```
3. Configurer les variables d'environnement (voir `.env.example`)

### Lancement des Scrapers
```
cd scrapers
python run.py scrape --source all
```

### Lancement de l'API
```
cd scrapers/api
uvicorn main:app --reload
```

### Accès à l'API
- Documentation Swagger : http://localhost:8000/api/v1/docs
- Documentation ReDoc : http://localhost:8000/api/v1/redoc
- Interface utilisateur : http://localhost:8000/static/index.html

## Structure du Projet

```
scrapers/
├── api/
│   ├── models/         # Modèles de données Pydantic
│   ├── routers/        # Routes de l'API
│   ├── services/       # Services métier
│   ├── static/         # Fichiers statiques (HTML, CSS, JS)
│   ├── config.py       # Configuration de l'API
│   ├── dependencies.py # Dépendances FastAPI
│   ├── main.py         # Point d'entrée de l'API
│   └── requirements.txt # Dépendances de l'API
├── scrapers/           # Modules de scraping
│   ├── lacentrale.py   # Scraper pour LaCentrale
│   ├── leboncoin.py    # Scraper pour LeBonCoin
│   ├── leparking.py    # Scraper pour LeParking
│   └── autoscout24.py  # Scraper pour AutoScout24
├── utils/              # Utilitaires
├── config.py           # Configuration des scrapers
├── database.py         # Gestion de la base de données
├── scraper.py          # Classe de base pour les scrapers
├── run.py              # Script d'exécution
└── requirements.txt    # Dépendances des scrapers
```

## Notes et Remarques

- Les scrapers sont configurés pour respecter les limites de requêtes des sites sources
- L'API utilise JWT pour l'authentification
- Les données sont stockées dans MongoDB
- Le projet est conçu pour être facilement extensible avec de nouvelles sources

## Contact

Pour toute question ou suggestion concernant ce projet, veuillez contacter l'équipe de développement.

---

*Dernière mise à jour : 27 février 2023* 