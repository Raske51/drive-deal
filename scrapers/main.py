#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script principal pour le scraping d'annonces de véhicules d'occasion
Ce script orchestre les différents scrapers pour récupérer des annonces depuis plusieurs plateformes
"""

import os
import json
import time
import logging
import argparse
import schedule
from datetime import datetime
from colorama import Fore, Style, init

# Import des scrapers spécifiques
from scrapers.lacentrale import LaCentraleScraper
from scrapers.leboncoin import LeBonCoinScraper
from scrapers.leparking import LeParkingScraper
from scrapers.autoscout24 import AutoScout24Scraper

# Import des utilitaires
from utils.database import DatabaseManager
from utils.image_downloader import ImageDownloader

# Initialisation de colorama pour les couleurs dans le terminal
init(autoreset=True)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scrapers/logs/scraper.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("CarScraper")

class CarScraperManager:
    """Gestionnaire principal des scrapers de véhicules"""
    
    def __init__(self, config_path="scrapers/config.json"):
        """Initialisation du gestionnaire de scraping"""
        self.config = self._load_config(config_path)
        self.db_manager = None
        self.image_downloader = None
        self._setup_directories()
        self._initialize_components()
        
    def _load_config(self, config_path):
        """Charge la configuration depuis un fichier JSON"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Fichier de configuration non trouvé: {config_path}")
            # Configuration par défaut
            return {
                "sources": ["lacentrale", "leboncoin", "leparking", "autoscout24"],
                "search_params": {
                    "brands": ["Renault", "Peugeot", "Citroen", "Volkswagen"],
                    "max_price": 30000,
                    "max_year": 2023,
                    "min_year": 2015
                },
                "database": {
                    "type": "json",  # ou "mysql", "sqlite"
                    "path": "scrapers/data/cars.json",
                    "mysql_config": {
                        "host": "localhost",
                        "user": "root",
                        "password": "",
                        "database": "car_scraper"
                    }
                },
                "images": {
                    "download": True,
                    "max_per_car": 10,
                    "path": "scrapers/data/images"
                },
                "proxy": {
                    "use_proxy": False,
                    "proxy_list": []
                },
                "scheduling": {
                    "enabled": False,
                    "time": "03:00"  # 3h du matin
                }
            }
    
    def _setup_directories(self):
        """Crée les répertoires nécessaires s'ils n'existent pas"""
        directories = [
            "scrapers/data",
            "scrapers/data/images",
            "scrapers/logs",
            "scrapers/scrapers"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            
        # Créer un fichier __init__.py vide dans le dossier scrapers pour en faire un package
        with open("scrapers/scrapers/__init__.py", "w") as f:
            pass
        
        with open("scrapers/utils/__init__.py", "w") as f:
            pass
    
    def _initialize_components(self):
        """Initialise les composants du scraper"""
        # Initialiser le gestionnaire de base de données
        db_config = self.config.get("database", {})
        self.db_manager = DatabaseManager(db_config)
        
        # Initialiser le téléchargeur d'images
        image_config = self.config.get("images", {})
        self.image_downloader = ImageDownloader(
            download_path=image_config.get("path", "scrapers/data/images"),
            max_images=image_config.get("max_per_car", 10)
        )
    
    def _get_scraper(self, source):
        """Retourne l'instance du scraper approprié selon la source"""
        scrapers = {
            "lacentrale": LaCentraleScraper,
            "leboncoin": LeBonCoinScraper,
            "leparking": LeParkingScraper,
            "autoscout24": AutoScout24Scraper
        }
        
        if source not in scrapers:
            logger.error(f"Source non supportée: {source}")
            return None
        
        return scrapers[source](self.config)
    
    def run_scraper(self, source=None):
        """Exécute le scraping pour une source spécifique ou toutes les sources"""
        sources = [source] if source else self.config.get("sources", [])
        
        for src in sources:
            try:
                logger.info(f"{Fore.CYAN}Démarrage du scraping pour {src}{Style.RESET_ALL}")
                scraper = self._get_scraper(src)
                
                if not scraper:
                    continue
                
                # Récupérer les annonces
                cars = scraper.scrape()
                
                # Télécharger les images si configuré
                if self.config.get("images", {}).get("download", True):
                    for car in cars:
                        car["local_images"] = self.image_downloader.download_images(
                            car.get("images", []),
                            car.get("id", "unknown")
                        )
                
                # Sauvegarder les données
                self.db_manager.save_cars(cars, source=src)
                
                logger.info(f"{Fore.GREEN}Scraping terminé pour {src}: {len(cars)} annonces récupérées{Style.RESET_ALL}")
                
            except Exception as e:
                logger.error(f"{Fore.RED}Erreur lors du scraping de {src}: {str(e)}{Style.RESET_ALL}")
    
    def schedule_scraping(self):
        """Configure le scraping automatique selon la planification"""
        if not self.config.get("scheduling", {}).get("enabled", False):
            return
        
        scraping_time = self.config.get("scheduling", {}).get("time", "03:00")
        
        logger.info(f"Planification du scraping quotidien à {scraping_time}")
        schedule.every().day.at(scraping_time).do(self.run_scraper)
        
        while True:
            schedule.run_pending()
            time.sleep(60)
    
    def export_data(self, format="json", output_path=None):
        """Exporte les données dans le format spécifié"""
        if not output_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"scrapers/data/export_{timestamp}.{format}"
        
        logger.info(f"Exportation des données au format {format} vers {output_path}")
        self.db_manager.export_data(format, output_path)
        
        return output_path

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Scraper d'annonces de véhicules d'occasion")
    parser.add_argument("--source", "-s", help="Source spécifique à scraper (lacentrale, leboncoin, leparking, autoscout24)")
    parser.add_argument("--config", "-c", default="scrapers/config.json", help="Chemin vers le fichier de configuration")
    parser.add_argument("--export", "-e", choices=["json", "csv"], help="Exporter les données dans le format spécifié")
    parser.add_argument("--output", "-o", help="Chemin de sortie pour l'exportation")
    parser.add_argument("--schedule", action="store_true", help="Activer la planification du scraping")
    
    args = parser.parse_args()
    
    # Créer le répertoire pour les logs s'il n'existe pas
    os.makedirs("scrapers/logs", exist_ok=True)
    
    print(f"{Fore.CYAN}=== Scraper d'annonces de véhicules d'occasion ==={Style.RESET_ALL}")
    
    manager = CarScraperManager(config_path=args.config)
    
    if args.schedule:
        manager.schedule_scraping()
    elif args.export:
        manager.export_data(format=args.export, output_path=args.output)
    else:
        manager.run_scraper(source=args.source)

if __name__ == "__main__":
    main() 