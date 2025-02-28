#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de test automatisé pour tous les scrapers
Permet de vérifier le bon fonctionnement de tous les scrapers avec différents paramètres
"""

import os
import sys
import time
import logging
import argparse
import concurrent.futures
from datetime import datetime
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
        logging.FileHandler(f"scrapers/logs/test_all_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("CarScraper.TestAll")

def test_scraper(source, config, max_pages=1, save_to_db=True, download_images=False):
    """Teste un scraper spécifique"""
    logger.info(f"Démarrage du test pour {source}")
    
    # Créer le scraper approprié
    scrapers = {
        "lacentrale": LaCentraleScraper,
        "leboncoin": LeBonCoinScraper,
        "leparking": LeParkingScraper,
        "autoscout24": AutoScout24Scraper
    }
    
    if source not in scrapers:
        logger.error(f"Source non supportée: {source}")
        return None
    
    # Limiter le nombre de pages pour le test
    scraping_config = config.get_scraping_config()
    scraping_config["max_pages_per_source"] = max_pages
    
    scraper = scrapers[source](config)
    
    try:
        # Exécuter le scraping
        start_time = time.time()
        cars = scraper.scrape()
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        results = {
            "source": source,
            "cars_count": len(cars),
            "execution_time": execution_time,
            "success": True,
            "error": None
        }
        
        logger.info(f"Test réussi pour {source}: {len(cars)} annonces en {execution_time:.2f} secondes")
        
        # Sauvegarder les données si demandé
        if save_to_db and cars:
            db_manager = DatabaseManager(config.get_database_config())
            db_manager.save_cars(cars, source)
            logger.info(f"Données sauvegardées dans la base de données pour {source}")
        
        # Télécharger les images si demandé
        if download_images and cars:
            image_downloader = ImageDownloader(
                download_path=config.get_image_config().get("path", "scrapers/output/images"),
                max_images=config.get_image_config().get("max_per_car", 2)
            )
            
            for car in cars[:2]:  # Limiter à 2 annonces pour le test
                car_id = car.get("id", "unknown")
                images = car.get("images", [])
                if images:
                    local_images = image_downloader.download_images(images, car_id)
                    logger.info(f"{len(local_images)} images téléchargées pour l'annonce {car_id}")
        
        return results
        
    except Exception as e:
        logger.error(f"Erreur lors du test du scraper {source}: {str(e)}")
        return {
            "source": source,
            "cars_count": 0,
            "execution_time": 0,
            "success": False,
            "error": str(e)
        }

def run_sequential_tests(sources, config, max_pages, save_to_db, download_images):
    """Exécute les tests séquentiellement"""
    results = []
    
    for source in sources:
        result = test_scraper(source, config, max_pages, save_to_db, download_images)
        if result:
            results.append(result)
    
    return results

def run_parallel_tests(sources, config, max_pages, save_to_db, download_images):
    """Exécute les tests en parallèle"""
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(sources)) as executor:
        future_to_source = {
            executor.submit(test_scraper, source, config, max_pages, save_to_db, download_images): source
            for source in sources
        }
        
        for future in concurrent.futures.as_completed(future_to_source):
            source = future_to_source[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
            except Exception as e:
                logger.error(f"Exception lors du test de {source}: {str(e)}")
    
    return results

def print_results_table(results):
    """Affiche les résultats sous forme de tableau"""
    print("\n" + "=" * 80)
    print(f"{Fore.CYAN}RÉSULTATS DES TESTS{Style.RESET_ALL}")
    print("=" * 80)
    print(f"{'Source':<15} | {'Statut':<10} | {'Annonces':<10} | {'Temps (s)':<10} | {'Erreur'}")
    print("-" * 80)
    
    for result in results:
        status = f"{Fore.GREEN}Succès{Style.RESET_ALL}" if result["success"] else f"{Fore.RED}Échec{Style.RESET_ALL}"
        error = result.get("error", "")
        if len(error) > 30:
            error = error[:27] + "..."
        
        print(f"{result['source']:<15} | {status:<10} | {result['cars_count']:<10} | {result['execution_time']:.2f}s{' ' * (9 - len(f'{result['execution_time']:.2f}s'))} | {error}")
    
    print("=" * 80)
    
    # Statistiques globales
    success_count = sum(1 for r in results if r["success"])
    total_cars = sum(r["cars_count"] for r in results)
    avg_time = sum(r["execution_time"] for r in results) / len(results) if results else 0
    
    print(f"\n{Fore.YELLOW}Statistiques globales:{Style.RESET_ALL}")
    print(f"- Scrapers testés: {len(results)}")
    print(f"- Scrapers réussis: {success_count}/{len(results)} ({success_count/len(results)*100:.1f}%)")
    print(f"- Total annonces récupérées: {total_cars}")
    print(f"- Temps moyen d'exécution: {avg_time:.2f}s")

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Test automatisé de tous les scrapers")
    parser.add_argument("--sources", "-s", nargs="+", default=["lacentrale", "leboncoin", "leparking", "autoscout24"], 
                        help="Sources à tester (par défaut: toutes)")
    parser.add_argument("--pages", "-p", type=int, default=1, help="Nombre maximum de pages à scraper")
    parser.add_argument("--no-save", action="store_true", help="Ne pas sauvegarder les données dans la base de données")
    parser.add_argument("--download-images", "-i", action="store_true", help="Télécharger les images des annonces")
    parser.add_argument("--parallel", action="store_true", help="Exécuter les tests en parallèle")
    parser.add_argument("--config", "-c", default="scrapers/config.json", help="Chemin vers le fichier de configuration")
    
    args = parser.parse_args()
    
    # Créer les répertoires nécessaires
    os.makedirs("scrapers/output", exist_ok=True)
    os.makedirs("scrapers/output/images", exist_ok=True)
    os.makedirs("scrapers/logs", exist_ok=True)
    
    # Charger la configuration
    config = ScraperConfig(args.config)
    
    print(f"{Fore.CYAN}=== Test automatisé de tous les scrapers ==={Style.RESET_ALL}")
    print(f"Sources: {', '.join(args.sources)}")
    print(f"Pages par source: {args.pages}")
    print(f"Mode d'exécution: {'Parallèle' if args.parallel else 'Séquentiel'}")
    print(f"Sauvegarde en base: {'Non' if args.no_save else 'Oui'}")
    print(f"Téléchargement images: {'Oui' if args.download_images else 'Non'}")
    
    # Exécuter les tests
    start_time = time.time()
    
    if args.parallel:
        results = run_parallel_tests(args.sources, config, args.pages, not args.no_save, args.download_images)
    else:
        results = run_sequential_tests(args.sources, config, args.pages, not args.no_save, args.download_images)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Afficher les résultats
    print_results_table(results)
    print(f"\nTemps total d'exécution: {total_time:.2f}s")

if __name__ == "__main__":
    main() 