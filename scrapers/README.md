# 🚗 Scraper d'annonces de véhicules d'occasion

Ce projet permet de récupérer automatiquement des annonces de véhicules d'occasion depuis plusieurs plateformes populaires :
- ✅ La Centrale
- ✅ LeBonCoin
- ✅ LeParking
- ✅ AutoScout24

## 📋 Fonctionnalités

- ✅ Scraping multi-sources (plusieurs sites de petites annonces)
- ✅ Filtrage par marque, prix, année, kilométrage, etc.
- ✅ Téléchargement et optimisation des images
- ✅ Stockage des données en JSON ou base de données (MySQL/SQLite)
- ✅ Export des données en CSV ou JSON
- ✅ Planification automatique des tâches de scraping
- ✅ Gestion des proxies pour éviter les blocages
- ✅ Rotation des User-Agents pour simuler différents navigateurs

## 🔍 Sites supportés et leurs spécificités

### La Centrale
- Filtrage avancé par marque, modèle, année, kilométrage, prix, etc.
- Extraction des caractéristiques techniques détaillées
- Récupération des images en haute qualité
- Détection du type de vendeur (professionnel ou particulier)

### LeBonCoin
- Filtrage par marque, modèle, prix, année, etc.
- Gestion des cookies et des popups
- Extraction des coordonnées du vendeur
- Support des annonces professionnelles et particulières

### LeParking
- Support multilingue (français, anglais, etc.)
- Filtrage avancé par marque, modèle, version, etc.
- Extraction des caractéristiques techniques détaillées
- Récupération des annonces internationales

### AutoScout24
- Filtrage avancé par marque, modèle, version, etc.
- Extraction des caractéristiques techniques détaillées
- Support des annonces professionnelles
- Récupération des images en haute qualité

## 🛠️ Prérequis

- Python 3.8+
- Chrome ou Chromium installé (pour Selenium)
- Pip (gestionnaire de paquets Python)

## 🔧 Installation

1. Cloner ce dépôt ou télécharger les fichiers

2. Installer les dépendances :
```bash
cd scrapers
pip install -r requirements.txt
```

3. Configurer le fichier `config.json` selon vos besoins (ou utiliser la configuration par défaut)

## 🚀 Utilisation

### Utilisation simplifiée avec run.py

Le script `run.py` permet de lancer facilement le scraper avec différentes options :

```bash
# Lancer le scraping sur toutes les sources
python run.py scrape

# Lancer le scraping sur une source spécifique
python run.py scrape --source lacentrale
python run.py scrape --source leboncoin
python run.py scrape --source leparking
python run.py scrape --source autoscout24

# Tester le scraper sur une source spécifique
python run.py test --source lacentrale --pages 2 --download-images

# Exporter les données en CSV
python run.py export --format csv --output output/export.csv
```

### Utilisation directe des scripts

#### Lancer le scraper pour toutes les sources

```bash
python scraper.py
```

#### Lancer le scraper pour une source spécifique

```bash
python scraper.py --source lacentrale
```

#### Exporter les données en CSV

```bash
python scraper.py --export csv --output output/export.csv
```

#### Planifier un scraping quotidien

```bash
python scraper.py --schedule
```

#### Tester rapidement le scraper

```bash
python test_scraper.py --source lacentrale --pages 1 --download-images
```

## ⚙️ Configuration

Le fichier `config.json` permet de personnaliser le comportement du scraper. Vous pouvez également utiliser la classe `ScraperConfig` pour accéder et modifier la configuration programmatiquement.

```json
{
  "sources": ["lacentrale", "leboncoin", "leparking", "autoscout24"],
  "search_params": {
    "brands": ["Renault", "Peugeot", "Citroen", "Volkswagen"],
    "max_price": 30000,
    "max_year": 2023,
    "min_year": 2015,
    "max_km": 150000,
    "fuel_types": ["Essence", "Diesel", "Hybride", "Electrique"],
    "transmission": ["Manuelle", "Automatique"]
  },
  "database": {
    "type": "json",
    "path": "output/cars.json"
  },
  "images": {
    "download": true,
    "max_per_car": 10,
    "path": "output/images"
  },
  "scraping": {
    "delay_between_requests": 2,
    "max_retries": 3,
    "timeout": 30,
    "max_pages_per_source": 5,
    "headless": true
  }
}
```

## 📁 Structure du projet

```
scrapers/
├── run.py               # Script de lancement simplifié
├── scraper.py           # Script principal
├── config.py            # Fichier de configuration (URLs, headers, user-agents)
├── database.py          # Gestion de la base de données (SQLite ou MySQL)
├── test_scraper.py      # Script de test pour le scraper
├── config.json          # Configuration JSON
├── requirements.txt     # Dépendances Python
├── README.md            # Documentation
├── NEXT_STEPS.md        # Prochaines étapes du projet
├── output/              # Stockage des fichiers JSON/CSV et images téléchargées
│   ├── cars.json        # Données des annonces
│   └── images/          # Images téléchargées
├── logs/                # Logs du scraper
├── scrapers/            # Modules de scraping spécifiques
│   ├── __init__.py
│   ├── base_scraper.py  # Classe de base pour tous les scrapers
│   ├── lacentrale.py    # Scraper pour La Centrale
│   ├── leboncoin.py     # Scraper pour LeBonCoin
│   ├── leparking.py     # Scraper pour LeParking (✅ Implémenté)
│   └── autoscout24.py   # Scraper pour AutoScout24 (✅ Implémenté)
└── utils/               # Modules utilitaires
    ├── __init__.py
    ├── database.py      # Gestion de la base de données
    └── image_downloader.py # Téléchargement et optimisation des images
```

## 🔄 Ajouter un nouveau site

Pour ajouter un nouveau site de petites annonces, suivez ces étapes :

1. Créez une nouvelle classe dans le dossier `scrapers/` qui hérite de `BaseScraper`
2. Implémentez les méthodes abstraites `_scrape_listings()` et `_scrape_car_details()`
3. Ajoutez la configuration du site dans `site_configs` dans `config.py`
4. Importez et enregistrez votre scraper dans la méthode `_get_scraper()` de `scraper.py`

Exemple de structure pour un nouveau scraper :

```python
from scrapers.base_scraper import BaseScraper

class MonNouveauScraper(BaseScraper):
    """Scraper pour le site MonNouveauSite"""
    
    def __init__(self, config):
        super().__init__(config)
        # Initialisation spécifique
    
    def _scrape_listings(self):
        """Récupère les annonces"""
        # Implémentation
        return cars
    
    def _scrape_car_details(self, url):
        """Récupère les détails d'une annonce"""
        # Implémentation
        return car_details
```

## ⚠️ Avertissement légal

Ce scraper est fourni à des fins éducatives uniquement. L'utilisation de ce scraper doit respecter les conditions d'utilisation des sites web ciblés. Certains sites web interdisent le scraping de leurs données. Utilisez ce scraper de manière responsable et à vos propres risques.

## 🔄 Maintenance et évolution

Les sites web changent régulièrement leur structure HTML, ce qui peut casser les sélecteurs CSS utilisés par le scraper. Si vous rencontrez des problèmes, vérifiez les sélecteurs dans les fichiers de scraping spécifiques et mettez-les à jour si nécessaire.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails. 