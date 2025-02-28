#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Module de configuration pour le scraper de véhicules
Gère le chargement et l'accès aux paramètres de configuration
"""

import os
import json
import logging
import random
from typing import Dict, List, Any, Optional

logger = logging.getLogger("CarScraper.Config")

class ScraperConfig:
    """Gestionnaire de configuration pour le scraper"""
    
    # Configuration par défaut
    DEFAULT_CONFIG = {
        "sources": ["lacentrale"],
        "search_params": {
            "brands": ["Renault", "Peugeot", "Citroen", "Volkswagen"],
            "max_price": 30000,
            "max_year": 2023,
            "min_year": 2015
        },
        "database": {
            "type": "json",  # ou "mysql", "sqlite"
            "path": "scrapers/output/cars.json",
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
            "path": "scrapers/output/images"
        },
        "proxy": {
            "use_proxy": False,
            "proxy_list": []
        },
        "scheduling": {
            "enabled": False,
            "time": "03:00"  # 3h du matin
        },
        "scraping": {
            "delay_between_requests": 2,
            "max_retries": 3,
            "timeout": 30,
            "max_pages_per_source": 5,
            "headless": True
        },
        "user_agents": [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
        ],
        "site_configs": {
            "lacentrale": {
                "base_url": "https://www.lacentrale.fr",
                "search_url": "https://www.lacentrale.fr/listing",
                "listing_selector": ".searchCard",
                "detail_selector": ".adview",
                "rate_limit": 2  # secondes entre les requêtes
            },
            "leboncoin": {
                "base_url": "https://www.leboncoin.fr",
                "search_url": "https://www.leboncoin.fr/recherche",
                "listing_selector": ".styles_adCard__HQRFN",
                "detail_selector": ".styles_adview__XYaZr",
                "rate_limit": 3
            },
            "leparking": {
                "base_url": "https://www.leparking.fr",
                "search_url": "https://www.leparking.fr/voiture-occasion/",
                "listing_selector": ".vehicle-card",
                "detail_selector": ".vehicle-detail",
                "rate_limit": 2
            },
            "autoscout24": {
                "base_url": "https://www.autoscout24.fr",
                "search_url": "https://www.autoscout24.fr/lst",
                "listing_selector": ".cldt-summary-full-item",
                "detail_selector": ".cldt-detail",
                "rate_limit": 3
            }
        }
    }
    
    def __init__(self, config_path: str = "scrapers/config.json"):
        """Initialisation de la configuration"""
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Charge la configuration depuis un fichier JSON"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                logger.info(f"Configuration chargée depuis {self.config_path}")
                return config
            else:
                logger.warning(f"Fichier de configuration non trouvé: {self.config_path}, utilisation de la configuration par défaut")
                return self.DEFAULT_CONFIG.copy()
        except Exception as e:
            logger.error(f"Erreur lors du chargement de la configuration: {str(e)}")
            return self.DEFAULT_CONFIG.copy()
    
    def save_config(self) -> bool:
        """Sauvegarde la configuration dans un fichier JSON"""
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
            logger.info(f"Configuration sauvegardée dans {self.config_path}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde de la configuration: {str(e)}")
            return False
    
    def get_sources(self) -> List[str]:
        """Retourne la liste des sources à scraper"""
        return self.config.get("sources", self.DEFAULT_CONFIG["sources"])
    
    def get_search_params(self) -> Dict[str, Any]:
        """Retourne les paramètres de recherche"""
        return self.config.get("search_params", self.DEFAULT_CONFIG["search_params"])
    
    def get_database_config(self) -> Dict[str, Any]:
        """Retourne la configuration de la base de données"""
        return self.config.get("database", self.DEFAULT_CONFIG["database"])
    
    def get_image_config(self) -> Dict[str, Any]:
        """Retourne la configuration des images"""
        return self.config.get("images", self.DEFAULT_CONFIG["images"])
    
    def get_proxy_config(self) -> Dict[str, Any]:
        """Retourne la configuration des proxies"""
        return self.config.get("proxy", self.DEFAULT_CONFIG["proxy"])
    
    def get_scheduling_config(self) -> Dict[str, Any]:
        """Retourne la configuration de la planification"""
        return self.config.get("scheduling", self.DEFAULT_CONFIG["scheduling"])
    
    def get_scraping_config(self) -> Dict[str, Any]:
        """Retourne la configuration du scraping"""
        return self.config.get("scraping", self.DEFAULT_CONFIG["scraping"])
    
    def get_user_agents(self) -> List[str]:
        """Retourne la liste des User-Agents"""
        return self.config.get("user_agents", self.DEFAULT_CONFIG["user_agents"])
    
    def get_random_user_agent(self) -> str:
        """Retourne un User-Agent aléatoire"""
        user_agents = self.get_user_agents()
        return random.choice(user_agents)
    
    def get_site_config(self, site: str) -> Dict[str, Any]:
        """Retourne la configuration spécifique à un site"""
        site_configs = self.config.get("site_configs", self.DEFAULT_CONFIG["site_configs"])
        return site_configs.get(site, {})
    
    def should_download_images(self) -> bool:
        """Indique si les images doivent être téléchargées"""
        return self.config.get("images", {}).get("download", True)
    
    def is_scheduling_enabled(self) -> bool:
        """Indique si la planification est activée"""
        return self.config.get("scheduling", {}).get("enabled", False)
    
    def get_scheduling_time(self) -> str:
        """Retourne l'heure de planification"""
        return self.config.get("scheduling", {}).get("time", "03:00")
    
    def get_delay_between_requests(self, site: Optional[str] = None) -> float:
        """Retourne le délai entre les requêtes"""
        if site:
            # Utiliser le rate_limit spécifique au site s'il existe
            site_config = self.get_site_config(site)
            if "rate_limit" in site_config:
                return site_config["rate_limit"]
        
        # Sinon, utiliser le délai global
        return self.config.get("scraping", {}).get("delay_between_requests", 2)
    
    def update_config(self, new_config: Dict[str, Any]) -> None:
        """Met à jour la configuration"""
        self.config.update(new_config)
        self.save_config() 