#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de lancement du scraper de véhicules
Permet de lancer facilement le scraper depuis la ligne de commande
"""

import os
import sys
import argparse
from colorama import Fore, Style, init

# Initialisation de colorama pour les couleurs dans le terminal
init(autoreset=True)

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Scraper d'annonces de véhicules d'occasion")
    parser.add_argument("action", choices=["scrape", "test", "export"], help="Action à effectuer")
    parser.add_argument("--source", "-s", help="Source spécifique à scraper (lacentrale, leboncoin, leparking, autoscout24)")
    parser.add_argument("--pages", "-p", type=int, default=5, help="Nombre maximum de pages à scraper")
    parser.add_argument("--format", "-f", choices=["json", "csv"], default="json", help="Format d'exportation des données")
    parser.add_argument("--output", "-o", help="Chemin de sortie pour l'exportation")
    parser.add_argument("--schedule", action="store_true", help="Activer la planification du scraping")
    parser.add_argument("--download-images", "-i", action="store_true", help="Télécharger les images des annonces")
    parser.add_argument("--config", "-c", default="scrapers/config.json", help="Chemin vers le fichier de configuration")
    
    args = parser.parse_args()
    
    # Créer les répertoires nécessaires
    os.makedirs("scrapers/output", exist_ok=True)
    os.makedirs("scrapers/output/images", exist_ok=True)
    os.makedirs("scrapers/logs", exist_ok=True)
    
    # Exécuter l'action demandée
    if args.action == "scrape":
        print(f"{Fore.CYAN}=== Lancement du scraper ==={Style.RESET_ALL}")
        
        cmd = f"python scrapers/scraper.py"
        
        if args.source:
            cmd += f" --source {args.source}"
        
        if args.config:
            cmd += f" --config {args.config}"
        
        if args.schedule:
            cmd += f" --schedule"
        
        os.system(cmd)
        
    elif args.action == "test":
        print(f"{Fore.CYAN}=== Test du scraper ==={Style.RESET_ALL}")
        
        cmd = f"python scrapers/test_scraper.py"
        
        if args.source:
            cmd += f" --source {args.source}"
        
        if args.pages:
            cmd += f" --pages {args.pages}"
        
        if args.download_images:
            cmd += f" --download-images"
        
        os.system(cmd)
        
    elif args.action == "export":
        print(f"{Fore.CYAN}=== Exportation des données ==={Style.RESET_ALL}")
        
        cmd = f"python scrapers/scraper.py --export {args.format}"
        
        if args.output:
            cmd += f" --output {args.output}"
        
        if args.config:
            cmd += f" --config {args.config}"
        
        os.system(cmd)
    
    print(f"{Fore.GREEN}=== Opération terminée ==={Style.RESET_ALL}")

if __name__ == "__main__":
    main() 