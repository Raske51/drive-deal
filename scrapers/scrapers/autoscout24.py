#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper pour le site AutoScout24
Récupère les annonces de véhicules d'occasion depuis le site AutoScout24
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

logger = logging.getLogger("CarScraper.AutoScout24")

class AutoScout24Scraper(BaseScraper):
    """Scraper pour le site AutoScout24"""
    
    BASE_URL = "https://www.autoscout24.fr"
    SEARCH_URL = "https://www.autoscout24.fr/lst"
    
    def __init__(self, config):
        """Initialisation du scraper AutoScout24"""
        super().__init__(config)
        self.max_pages = self.scraping_config.get("max_pages_per_source", 5)
        self.site_config = self.config.get_site_config("autoscout24")
    
    def _build_search_url(self, page=1):
        """Construit l'URL de recherche avec les paramètres spécifiés"""
        params = self.search_params
        
        # URL de base pour la recherche de voitures
        url = f"{self.SEARCH_URL}?page={page}"
        
        # Ajouter les marques
        brands = params.get("brands", [])
        if brands:
            brand_param = "&mmvmk0="
            brand_param += "&mmvmk0=".join([str(self._get_brand_id(brand)) for brand in brands])
            url += brand_param
        
        # Ajouter le prix max
        max_price = params.get("max_price")
        if max_price:
            url += f"&priceto={max_price}"
        
        # Ajouter l'année min et max
        min_year = params.get("min_year")
        max_year = params.get("max_year")
        if min_year:
            url += f"&fregfrom={min_year}"
        if max_year:
            url += f"&fregto={max_year}"
        
        # Ajouter le kilométrage max
        max_km = params.get("max_km")
        if max_km:
            url += f"&kmto={max_km}"
        
        # Ajouter les types de carburant
        fuel_types = params.get("fuel_types", [])
        fuel_mapping = {
            "Essence": "B",
            "Diesel": "D",
            "Hybride": "2",
            "Electrique": "E"
        }
        if fuel_types:
            fuel_params = []
            for fuel in fuel_types:
                if fuel in fuel_mapping:
                    fuel_params.append(fuel_mapping[fuel])
            if fuel_params:
                url += f"&fuel={'%2C'.join(fuel_params)}"
        
        # Ajouter les types de transmission
        transmission = params.get("transmission", [])
        transmission_mapping = {
            "Manuelle": "M",
            "Automatique": "A"
        }
        if transmission:
            transmission_params = []
            for trans in transmission:
                if trans in transmission_mapping:
                    transmission_params.append(transmission_mapping[trans])
            if transmission_params:
                url += f"&gear={'%2C'.join(transmission_params)}"
        
        # Tri par date de publication (plus récent d'abord)
        url += "&sort=age&desc=1&atype=C"
        
        return url
    
    def _get_brand_id(self, brand_name):
        """Retourne l'ID de la marque pour AutoScout24"""
        # Mapping simplifié des marques les plus courantes
        brand_mapping = {
            "Renault": 54,
            "Peugeot": 49,
            "Citroen": 14,
            "Volkswagen": 74,
            "Audi": 9,
            "BMW": 13,
            "Mercedes": 47,
            "Ford": 22,
            "Toyota": 69,
            "Nissan": 48,
            "Opel": 50,
            "Fiat": 21,
            "Seat": 59,
            "Skoda": 62,
            "Hyundai": 31,
            "Kia": 35,
            "Dacia": 121,
            "Volvo": 73
        }
        
        return brand_mapping.get(brand_name, 0)  # 0 = toutes les marques
    
    def scrape(self):
        """Exécute le scraping des annonces"""
        logger.info("Démarrage du scraping AutoScout24")
        
        try:
            # Initialiser la session requests
            self._init_requests()
            
            # Scraper les annonces
            cars = self._scrape_listings()
            
            # Fermer le navigateur
            self._close()
            
            return cars
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping AutoScout24: {str(e)}")
            self._close()
            return []
    
    def _scrape_listings(self):
        """Scrape les annonces d'AutoScout24"""
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
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".cldt-summary-full-item"))
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
                car_cards = soup.select(".cldt-summary-full-item")
                
                if not car_cards:
                    logger.warning(f"Aucune annonce trouvée sur la page {page}")
                    break
                
                logger.info(f"Trouvé {len(car_cards)} annonces sur la page {page}")
                
                # Traiter chaque annonce
                for card in car_cards:
                    try:
                        # Extraire l'URL de l'annonce
                        link_elem = card.select_one("a.cldt-summary-full-item-main")
                        if not link_elem or not link_elem.get("href"):
                            continue
                        
                        detail_url = urljoin(self.BASE_URL, link_elem.get("href"))
                        
                        # Extraire l'ID de l'annonce
                        car_id = self._extract_car_id(detail_url)
                        
                        # Extraire les informations de base
                        title_elem = card.select_one("h2.cldt-summary-makemodel")
                        title = self._clean_text(title_elem.text) if title_elem else ""
                        
                        version_elem = card.select_one("h2.cldt-summary-version")
                        version = self._clean_text(version_elem.text) if version_elem else ""
                        if version:
                            title = f"{title} {version}"
                        
                        price_elem = card.select_one("span.cldt-price")
                        price_text = self._clean_text(price_elem.text) if price_elem else ""
                        price = self._extract_number(price_text)
                        
                        # Extraire les caractéristiques de base
                        specs_elems = card.select(".cldt-summary-vehicle-data span")
                        
                        year = None
                        mileage = None
                        fuel_type = None
                        transmission = None
                        
                        for spec in specs_elems:
                            spec_text = self._clean_text(spec.text)
                            
                            if re.search(r'\b\d{2}/\d{4}\b', spec_text):  # Format MM/YYYY
                                year_match = re.search(r'\b\d{2}/(\d{4})\b', spec_text)
                                if year_match:
                                    year = int(year_match.group(1))
                            elif "km" in spec_text.lower():  # Kilométrage
                                mileage = self._extract_number(spec_text)
                            elif any(fuel in spec_text.lower() for fuel in ["essence", "diesel", "hybride", "électrique"]):
                                fuel_type = spec_text
                            elif any(trans in spec_text.lower() for trans in ["manuelle", "automatique"]):
                                transmission = spec_text
                        
                        # Extraire la localisation
                        location_elem = card.select_one(".cldt-summary-seller-contact-address")
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
                next_button = soup.select_one("a.next-page")
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
            # Format typique: https://www.autoscout24.fr/annonces/[marque]/[modele]/[details]-[id]
            match = re.search(r'-(\d+)$', url)
            if match:
                return f"autoscout24_{match.group(1)}"
            
            # Fallback: utiliser l'URL complète pour générer un ID
            parsed_url = urlparse(url)
            path = parsed_url.path
            return f"autoscout24_{path.replace('/', '_')}"
            
        except Exception:
            # Générer un ID basé sur l'URL complète
            return f"autoscout24_{hash(url)}"
    
    def _handle_cookies(self):
        """Gère la bannière de cookies si elle est présente"""
        try:
            cookie_button = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
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
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".cldt-detail"))
                )
            except TimeoutException:
                logger.warning(f"Timeout en attendant la page de détails: {url}")
                return None
            
            # Extraire les détails
            soup = BeautifulSoup(self.driver.page_source, "html.parser")
            
            # Extraire les images
            images = []
            image_elements = soup.select(".gallery-picture img")
            for img in image_elements:
                src = img.get("src") or img.get("data-src")
                if src and "data:image" not in src:
                    images.append(src)
            
            # Extraire la description
            description_elem = soup.select_one(".cldt-detail-description")
            description = self._clean_text(description_elem.text) if description_elem else ""
            
            # Extraire les caractéristiques détaillées
            features = {}
            feature_sections = soup.select(".cldt-detail-section")
            
            for section in feature_sections:
                section_title_elem = section.select_one(".cldt-detail-section-title")
                if not section_title_elem:
                    continue
                
                section_title = self._clean_text(section_title_elem.text)
                
                # Extraire les caractéristiques techniques
                feature_items = section.select(".cldt-detail-params-item")
                for item in feature_items:
                    label_elem = item.select_one(".cldt-detail-params-label")
                    value_elem = item.select_one(".cldt-detail-params-value")
                    
                    if label_elem and value_elem:
                        key = self._clean_text(label_elem.text)
                        value = self._clean_text(value_elem.text)
                        features[key] = value
            
            # Extraire les informations du vendeur
            seller_type = "Professionnel"  # Par défaut
            seller_name = ""
            seller_phone = ""
            
            seller_elem = soup.select_one(".cldt-vendor-contact-box")
            if seller_elem:
                seller_type_elem = seller_elem.select_one(".cldt-vendor-type")
                if seller_type_elem:
                    seller_type = self._clean_text(seller_type_elem.text)
                
                seller_name_elem = seller_elem.select_one(".cldt-vendor-name")
                if seller_name_elem:
                    seller_name = self._clean_text(seller_name_elem.text)
                
                seller_phone_elem = seller_elem.select_one(".cldt-vendor-phone")
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
                
            if "Première immatriculation" in features:
                year_text = features["Première immatriculation"]
                if re.search(r'\b\d{4}\b', year_text):
                    car_details["year"] = int(re.search(r'\b\d{4}\b', year_text).group())
            
            if "Kilométrage" in features:
                mileage_text = features["Kilométrage"]
                car_details["mileage"] = self._extract_number(mileage_text)
            
            if "Carburant" in features:
                car_details["fuel_type"] = features["Carburant"]
            
            if "Boîte de vitesses" in features:
                car_details["transmission"] = features["Boîte de vitesses"]
            
            return car_details
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping des détails: {str(e)}")
            return None 