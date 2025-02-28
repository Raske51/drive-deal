#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper pour le site LeParking
Récupère les annonces de véhicules d'occasion depuis le site LeParking
"""

import re
import json
import logging
import time
from urllib.parse import urljoin, urlparse, parse_qs, quote
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger("CarScraper.LeParking")

class LeParkingScraper(BaseScraper):
    """Scraper pour le site LeParking"""
    
    BASE_URL = "https://www.leparking.fr"
    SEARCH_URL = "https://www.leparking.fr/voiture-occasion/"
    
    def __init__(self, config):
        """Initialisation du scraper LeParking"""
        super().__init__(config)
        self.max_pages = self.scraping_config.get("max_pages_per_source", 5)
        self.site_config = self.config.get_site_config("leparking")
    
    def _build_search_url(self, page=1):
        """Construit l'URL de recherche avec les paramètres spécifiés"""
        params = self.search_params
        
        # URL de base pour la recherche de voitures
        url = f"{self.SEARCH_URL}?page={page}"
        
        # Ajouter les marques
        brands = params.get("brands", [])
        if brands:
            brand_param = "&brand="
            brand_param += "&brand=".join([quote(brand.lower()) for brand in brands])
            url += brand_param
        
        # Ajouter le prix max
        max_price = params.get("max_price")
        if max_price:
            url += f"&prix_max={max_price}"
        
        # Ajouter l'année min et max
        min_year = params.get("min_year")
        max_year = params.get("max_year")
        if min_year:
            url += f"&annee_min={min_year}"
        if max_year:
            url += f"&annee_max={max_year}"
        
        # Ajouter le kilométrage max
        max_km = params.get("max_km")
        if max_km:
            url += f"&km_max={max_km}"
        
        # Ajouter les types de carburant
        fuel_types = params.get("fuel_types", [])
        fuel_mapping = {
            "Essence": "essence",
            "Diesel": "diesel",
            "Hybride": "hybride",
            "Electrique": "electrique"
        }
        if fuel_types:
            fuel_params = []
            for fuel in fuel_types:
                if fuel in fuel_mapping:
                    fuel_params.append(fuel_mapping[fuel])
            if fuel_params:
                url += f"&carburant={'&carburant='.join(fuel_params)}"
        
        # Ajouter les types de transmission
        transmission = params.get("transmission", [])
        transmission_mapping = {
            "Manuelle": "manuelle",
            "Automatique": "automatique"
        }
        if transmission:
            transmission_params = []
            for trans in transmission:
                if trans in transmission_mapping:
                    transmission_params.append(transmission_mapping[trans])
            if transmission_params:
                url += f"&boite={'&boite='.join(transmission_params)}"
        
        return url
    
    def scrape(self):
        """Exécute le scraping des annonces"""
        logger.info("Démarrage du scraping LeParking")
        
        try:
            # Initialiser la session requests
            self._init_requests()
            
            # Scraper les annonces
            cars = self._scrape_listings()
            
            # Fermer le navigateur
            self._close()
            
            return cars
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping LeParking: {str(e)}")
            self._close()
            return []
    
    def _scrape_listings(self):
        """Scrape les annonces de LeParking"""
        all_cars = []
        
        # Initialiser Selenium
        self._init_selenium()
        
        for page in range(1, self.max_pages + 1):
            try:
                search_url = self._build_search_url(page)
                logger.info(f"Scraping de la page {page}/{self.max_pages}: {search_url}")
                
                # Naviguer vers la page de recherche
                if not self._safe_get_selenium(search_url):
                    logger.error(f"Impossible d'accéder à la page {page}")
                    continue
                
                # Attendre que les résultats se chargent
                try:
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".vehicle-card"))
                    )
                except TimeoutException:
                    logger.warning(f"Timeout en attendant les résultats sur la page {page}")
                    continue
                
                # Gérer les cookies si nécessaire
                self._handle_cookies()
                
                # Faire défiler la page pour charger tous les résultats
                self._scroll_to_bottom(scroll_pause_time=1.0, max_scrolls=3)
                
                # Extraire les annonces
                soup = BeautifulSoup(self.driver.page_source, "html.parser")
                car_cards = soup.select(".vehicle-card")
                
                if not car_cards:
                    logger.warning(f"Aucune annonce trouvée sur la page {page}")
                    break
                
                logger.info(f"Trouvé {len(car_cards)} annonces sur la page {page}")
                
                # Traiter chaque annonce
                for card in car_cards:
                    try:
                        # Extraire l'URL de l'annonce
                        link_elem = card.select_one(".vehicle-card__link")
                        if not link_elem or not link_elem.get("href"):
                            continue
                        
                        detail_url = urljoin(self.BASE_URL, link_elem.get("href"))
                        
                        # Extraire l'ID de l'annonce
                        car_id = self._extract_car_id(detail_url)
                        
                        # Extraire les informations de base
                        title_elem = card.select_one(".vehicle-card__title")
                        title = self._clean_text(title_elem.text) if title_elem else ""
                        
                        price_elem = card.select_one(".vehicle-card__price")
                        price_text = self._clean_text(price_elem.text) if price_elem else ""
                        price = self._extract_number(price_text)
                        
                        # Extraire les caractéristiques de base
                        specs_container = card.select_one(".vehicle-card__specs")
                        specs_elems = specs_container.select("li") if specs_container else []
                        
                        year = None
                        mileage = None
                        fuel_type = None
                        transmission = None
                        
                        for spec in specs_elems:
                            spec_text = self._clean_text(spec.text)
                            
                            if re.search(r'\b\d{4}\b', spec_text):  # Année
                                year = int(re.search(r'\b\d{4}\b', spec_text).group())
                            elif "km" in spec_text.lower():  # Kilométrage
                                mileage = self._extract_number(spec_text)
                            elif any(fuel in spec_text.lower() for fuel in ["essence", "diesel", "hybride", "électrique"]):
                                fuel_type = spec_text
                            elif any(trans in spec_text.lower() for trans in ["manuelle", "automatique"]):
                                transmission = spec_text
                        
                        # Extraire la localisation
                        location_elem = card.select_one(".vehicle-card__location")
                        location = self._clean_text(location_elem.text) if location_elem else ""
                        
                        # Extraire la marque et le modèle depuis le titre
                        brand = None
                        model = None
                        
                        if title:
                            # Essayer d'extraire la marque du titre
                            for b in self.search_params.get("brands", []):
                                if b.lower() in title.lower():
                                    brand = b
                                    # Le modèle est souvent après la marque
                                    title_parts = title.split(b, 1)
                                    if len(title_parts) > 1:
                                        model = self._clean_text(title_parts[1])
                                    break
                        
                        # Créer l'objet voiture avec les informations de base
                        car = {
                            "id": car_id,
                            "title": title,
                            "brand": brand,
                            "model": model,
                            "price": price,
                            "year": year,
                            "mileage": mileage,
                            "fuel_type": fuel_type,
                            "transmission": transmission,
                            "location": location,
                            "url": detail_url
                        }
                        
                        # Scraper les détails complets de l'annonce
                        car_details = self._scrape_car_details(detail_url)
                        if car_details:
                            car.update(car_details)
                        
                        all_cars.append(car)
                        
                        # Attendre entre les requêtes
                        self._wait_between_requests()
                        
                    except Exception as e:
                        logger.error(f"Erreur lors du traitement d'une annonce: {str(e)}")
                
                # Vérifier s'il y a une page suivante
                next_button = soup.select_one(".pagination__next")
                if not next_button or "disabled" in next_button.get("class", []):
                    logger.info("Dernière page atteinte")
                    break
                
                # Attendre entre les pages
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Erreur lors du scraping de la page {page}: {str(e)}")
        
        logger.info(f"Scraping terminé: {len(all_cars)} annonces récupérées")
        return all_cars
    
    def _extract_car_id(self, url):
        """Extrait l'ID de l'annonce depuis l'URL"""
        try:
            # Format typique: https://www.leparking.fr/voiture-detail/[marque]/[modele]/[id].html
            match = re.search(r'/([^/]+)\.html$', url)
            if match:
                return f"leparking_{match.group(1)}"
            
            # Fallback: utiliser l'URL complète pour générer un ID
            parsed_url = urlparse(url)
            path = parsed_url.path
            return f"leparking_{path.replace('/', '_')}"
            
        except Exception:
            # Générer un ID basé sur l'URL complète
            return f"leparking_{hash(url)}"
    
    def _handle_cookies(self):
        """Gère la bannière de cookies si elle est présente"""
        try:
            cookie_button = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, ".cookie-consent__accept"))
            )
            cookie_button.click()
            logger.info("Bannière de cookies acceptée")
        except (TimeoutException, NoSuchElementException):
            logger.info("Pas de bannière de cookies détectée ou déjà acceptée")
    
    def _scrape_car_details(self, url):
        """Scrape les détails d'une annonce"""
        logger.info(f"Scraping des détails: {url}")
        
        try:
            # Naviguer vers la page de détails
            if not self._safe_get_selenium(url):
                logger.error(f"Impossible d'accéder à la page de détails: {url}")
                return None
            
            # Attendre que la page se charge
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".vehicle-detail"))
                )
            except TimeoutException:
                logger.warning(f"Timeout en attendant la page de détails: {url}")
                return None
            
            # Extraire les détails
            soup = BeautifulSoup(self.driver.page_source, "html.parser")
            
            # Extraire les images
            images = []
            image_elements = soup.select(".vehicle-detail__gallery img")
            for img in image_elements:
                src = img.get("src") or img.get("data-src")
                if src and "data:image" not in src:
                    images.append(src)
            
            # Extraire la description
            description_elem = soup.select_one(".vehicle-detail__description")
            description = self._clean_text(description_elem.text) if description_elem else ""
            
            # Extraire les caractéristiques détaillées
            features = {}
            feature_elements = soup.select(".vehicle-detail__specs li")
            for feature in feature_elements:
                feature_text = self._clean_text(feature.text)
                if ":" in feature_text:
                    key, value = feature_text.split(":", 1)
                    features[self._clean_text(key)] = self._clean_text(value)
            
            # Extraire les informations du vendeur
            seller_type = "Professionnel"  # Par défaut
            seller_name = ""
            seller_phone = ""
            
            seller_elem = soup.select_one(".vehicle-detail__seller")
            if seller_elem:
                seller_type_elem = seller_elem.select_one(".vehicle-detail__seller-type")
                if seller_type_elem:
                    seller_type = self._clean_text(seller_type_elem.text)
                
                seller_name_elem = seller_elem.select_one(".vehicle-detail__seller-name")
                if seller_name_elem:
                    seller_name = self._clean_text(seller_name_elem.text)
                
                seller_phone_elem = seller_elem.select_one(".vehicle-detail__seller-phone")
                if seller_phone_elem:
                    seller_phone = self._clean_text(seller_phone_elem.text)
            
            # Extraire la marque et le modèle depuis les caractéristiques
            brand = None
            model = None
            
            if "Marque" in features:
                brand = features["Marque"]
            
            if "Modèle" in features:
                model = features["Modèle"]
            
            # Construire le dictionnaire de détails
            car_details = {
                "description": description,
                "images": images,
                "features": features,
                "seller_type": seller_type,
                "seller_name": seller_name,
                "seller_phone": seller_phone
            }
            
            # Mettre à jour les informations de base si elles sont plus précises dans les détails
            if brand:
                car_details["brand"] = brand
            
            if model:
                car_details["model"] = model
                
            if "Année" in features:
                year_text = features["Année"]
                if re.search(r'\b\d{4}\b', year_text):
                    car_details["year"] = int(re.search(r'\b\d{4}\b', year_text).group())
            
            if "Kilométrage" in features:
                mileage_text = features["Kilométrage"]
                car_details["mileage"] = self._extract_number(mileage_text)
            
            if "Carburant" in features:
                car_details["fuel_type"] = features["Carburant"]
            
            if "Boîte de vitesse" in features:
                car_details["transmission"] = features["Boîte de vitesse"]
            
            return car_details
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping des détails: {str(e)}")
            return None 