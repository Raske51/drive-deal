#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de test pour le scraper de véhicules
Permet de tester rapidement le scraping sur une source spécifique
"""

import os
import sys
import logging
import argparse
from colorama import Fore, Style, init

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import des modules du scraper
from scrapers.config import ScraperConfig
from scrapers.scrapers import LaCentraleScraper, LeBonCoinScraper, LeParkingScraper, AutoScout24Scraper
from scrapers.database import DatabaseManager
from scrapers.utils import ImageDownloader

# Initialisation de colorama pour les couleurs dans le terminal
init(autoreset=True)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("CarScraper.Test")

def test_scraper(source, max_pages=1, save_to_db=True, download_images=False):
    """Teste le scraper sur une source spécifique"""
    print(f"{Fore.CYAN}=== Test du scraper pour {source} ==={Style.RESET_ALL}")
    
    # Charger la configuration
    config = ScraperConfig("scrapers/config.json")
    
    # Limiter le nombre de pages pour le test
    scraping_config = config.get_scraping_config()
    scraping_config["max_pages_per_source"] = max_pages
    
    # Créer le scraper approprié
    if source == "lacentrale":
        scraper = LaCentraleScraper(config)
    elif source == "leboncoin":
        scraper = LeBonCoinScraper(config)
    elif source == "leparking":
        scraper = LeParkingScraper(config)
    elif source == "autoscout24":
        scraper = AutoScout24Scraper(config)
    else:
        logger.error(f"Source non supportée: {source}")
        return
    
    try:
        # Exécuter le scraping
        logger.info(f"Démarrage du scraping pour {source} (max {max_pages} pages)")
        cars = scraper.scrape()
        
        logger.info(f"{Fore.GREEN}Scraping terminé: {len(cars)} annonces récupérées{Style.RESET_ALL}")
        
        # Afficher un aperçu des annonces
        print(f"\n{Fore.YELLOW}Aperçu des annonces récupérées:{Style.RESET_ALL}")
        for i, car in enumerate(cars[:5]):  # Afficher les 5 premières annonces
            print(f"\n{Fore.CYAN}Annonce {i+1}:{Style.RESET_ALL}")
            print(f"  ID: {car.get('id', 'N/A')}")
            print(f"  Titre: {car.get('title', 'N/A')}")
            print(f"  Marque: {car.get('brand', 'N/A')}")
            print(f"  Modèle: {car.get('model', 'N/A')}")
            print(f"  Année: {car.get('year', 'N/A')}")
            print(f"  Prix: {car.get('price', 'N/A')} €")
            print(f"  Kilométrage: {car.get('mileage', 'N/A')} km")
            print(f"  Carburant: {car.get('fuel_type', 'N/A')}")
            print(f"  Transmission: {car.get('transmission', 'N/A')}")
            print(f"  Localisation: {car.get('location', 'N/A')}")
            print(f"  URL: {car.get('url', 'N/A')}")
            print(f"  Images: {len(car.get('images', []))} images")
        
        if len(cars) > 5:
            print(f"\n... et {len(cars) - 5} autres annonces")
        
        # Sauvegarder les données si demandé
        if save_to_db and cars:
            db_manager = DatabaseManager(config.get_database_config())
            db_manager.save_cars(cars, source)
            logger.info(f"Données sauvegardées dans la base de données")
        
        # Télécharger les images si demandé
        if download_images and cars:
            image_downloader = ImageDownloader(
                download_path=config.get_image_config().get("path", "scrapers/output/images"),
                max_images=config.get_image_config().get("max_per_car", 5)
            )
            
            logger.info(f"Téléchargement des images pour {min(3, len(cars))} annonces...")
            for car in cars[:3]:  # Limiter à 3 annonces pour le test
                car_id = car.get("id", "unknown")
                images = car.get("images", [])
                if images:
                    logger.info(f"Téléchargement de {len(images)} images pour l'annonce {car_id}")
                    local_images = image_downloader.download_images(images, car_id)
                    logger.info(f"{len(local_images)} images téléchargées")
        
        return cars
        
    except Exception as e:
        logger.error(f"Erreur lors du test du scraper: {str(e)}")
        return None

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Test du scraper de véhicules")
    parser.add_argument("--source", "-s", default="lacentrale", help="Source à tester (lacentrale, leboncoin, leparking, autoscout24)")
    parser.add_argument("--pages", "-p", type=int, default=1, help="Nombre maximum de pages à scraper")
    parser.add_argument("--no-save", action="store_true", help="Ne pas sauvegarder les données dans la base de données")
    parser.add_argument("--download-images", action="store_true", help="Télécharger les images des annonces")
    
    args = parser.parse_args()
    
    # Créer les répertoires nécessaires
    os.makedirs("scrapers/output", exist_ok=True)
    os.makedirs("scrapers/output/images", exist_ok=True)
    
    # Tester le scraper
    test_scraper(
        source=args.source,
        max_pages=args.pages,
        save_to_db=not args.no_save,
        download_images=args.download_images
    )

if __name__ == "__main__":
    main() 