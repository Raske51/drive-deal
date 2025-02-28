#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper pour le site La Centrale
Récupère les annonces de véhicules d'occasion depuis le site La Centrale
"""

import re
import logging
import time
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger("CarScraper.LaCentrale")

class LaCentraleScraper(BaseScraper):
    """Scraper pour le site La Centrale"""
    
    BASE_URL = "https://www.lacentrale.fr"
    SEARCH_URL = "https://www.lacentrale.fr/listing"
    
    def __init__(self, config):
        """Initialisation du scraper La Centrale"""
        super().__init__(config)
        self.max_pages = self.scraping_config.get("max_pages_per_source", 5)
    
    def _build_search_url(self, page=1):
        """Construit l'URL de recherche avec les paramètres spécifiés"""
        params = self.search_params
        
        # Paramètres de base
        url = f"{self.SEARCH_URL}?page={page}"
        
        # Ajouter les marques
        brands = params.get("brands", [])
        if brands:
            # La Centrale utilise des codes pour les marques, mais nous utilisons les noms pour simplifier
            # Dans un cas réel, il faudrait mapper les noms aux codes
            brand_param = "&makesModelsCommercialNames=".join(brands)
            url += f"&makesModelsCommercialNames={brand_param}"
        
        # Ajouter le prix max
        max_price = params.get("max_price")
        if max_price:
            url += f"&priceMax={max_price}"
        
        # Ajouter l'année min et max
        min_year = params.get("min_year")
        max_year = params.get("max_year")
        if min_year:
            url += f"&yearMin={min_year}"
        if max_year:
            url += f"&yearMax={max_year}"
        
        # Ajouter le kilométrage max
        max_km = params.get("max_km")
        if max_km:
            url += f"&mileageMax={max_km}"
        
        # Ajouter les types de carburant
        fuel_types = params.get("fuel_types", [])
        fuel_mapping = {
            "Essence": "ess",
            "Diesel": "dies",
            "Hybride": "hyb",
            "Electrique": "elec"
        }
        if fuel_types:
            fuel_params = []
            for fuel in fuel_types:
                if fuel in fuel_mapping:
                    fuel_params.append(fuel_mapping[fuel])
            if fuel_params:
                url += f"&energies={'%2C'.join(fuel_params)}"
        
        # Ajouter les types de transmission
        transmission = params.get("transmission", [])
        transmission_mapping = {
            "Manuelle": "MANUAL",
            "Automatique": "AUTO"
        }
        if transmission:
            transmission_params = []
            for trans in transmission:
                if trans in transmission_mapping:
                    transmission_params.append(transmission_mapping[trans])
            if transmission_params:
                url += f"&gearbox={'%2C'.join(transmission_params)}"
        
        return url
    
    def _scrape_listings(self):
        """Scrape les annonces de La Centrale"""
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
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".searchCard"))
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
                car_cards = soup.select(".searchCard")
                
                if not car_cards:
                    logger.warning(f"Aucune annonce trouvée sur la page {page}")
                    break
                
                logger.info(f"Trouvé {len(car_cards)} annonces sur la page {page}")
                
                # Traiter chaque annonce
                for card in car_cards:
                    try:
                        # Extraire l'URL de l'annonce
                        link_elem = card.select_one(".searchCard__link")
                        if not link_elem or not link_elem.get("href"):
                            continue
                        
                        detail_url = urljoin(self.BASE_URL, link_elem.get("href"))
                        
                        # Extraire l'ID de l'annonce
                        car_id = self._extract_car_id(detail_url)
                        
                        # Extraire les informations de base
                        title_elem = card.select_one(".searchCard__title")
                        title = self._clean_text(title_elem.text) if title_elem else ""
                        
                        price_elem = card.select_one(".searchCard__price")
                        price_text = self._clean_text(price_elem.text) if price_elem else ""
                        price = self._extract_number(price_text)
                        
                        # Extraire les caractéristiques de base
                        year = None
                        mileage = None
                        fuel_type = None
                        transmission = None
                        
                        specs_elems = card.select(".searchCard__characteristic")
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
                        location_elem = card.select_one(".searchCard__dptCont")
                        location = self._clean_text(location_elem.text) if location_elem else ""
                        
                        # Créer l'objet voiture avec les informations de base
                        car = {
                            "id": car_id,
                            "title": title,
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
                next_button = soup.select_one(".pagination__next:not(.pagination__next--disabled)")
                if not next_button:
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
            # Format typique: https://www.lacentrale.fr/auto-occasion-annonce-12345.html
            match = re.search(r'annonce-(\d+)\.html', url)
            if match:
                return f"lacentrale_{match.group(1)}"
            
            # Fallback: utiliser l'URL complète pour générer un ID
            parsed_url = urlparse(url)
            path = parsed_url.path
            return f"lacentrale_{path.replace('/', '_')}"
            
        except Exception:
            # Générer un ID basé sur l'URL complète
            return f"lacentrale_{hash(url)}"
    
    def _handle_cookies(self):
        """Gère la bannière de cookies si elle est présente"""
        try:
            cookie_button = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "#didomi-notice-agree-button"))
            )
            cookie_button.click()
            logger.info("Bannière de cookies acceptée")
        except (TimeoutException, NoSuchElementException):
            # La bannière n'est pas présente ou a déjà été acceptée
            pass
    
    def _scrape_car_details(self, url):
        """Scrape les détails d'une annonce spécifique"""
        try:
            logger.info(f"Scraping des détails de l'annonce: {url}")
            
            # Naviguer vers la page de détails
            if not self._safe_get_selenium(url):
                logger.error(f"Impossible d'accéder à la page de détails: {url}")
                return None
            
            # Attendre que la page se charge
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".adview"))
                )
            except TimeoutException:
                logger.warning(f"Timeout en attendant les détails de l'annonce: {url}")
                return None
            
            # Gérer les cookies si nécessaire
            self._handle_cookies()
            
            # Extraire les détails
            soup = BeautifulSoup(self.driver.page_source, "html.parser")
            
            # Extraire les informations détaillées
            car_details = {}
            
            # Marque et modèle
            title_elem = soup.select_one(".adview_header__title")
            if title_elem:
                title = self._clean_text(title_elem.text)
                # Essayer d'extraire la marque et le modèle du titre
                parts = title.split(" ", 1)
                if len(parts) >= 2:
                    car_details["brand"] = parts[0]
                    car_details["model"] = parts[1]
            
            # Description
            description_elem = soup.select_one(".adview_description__content")
            if description_elem:
                car_details["description"] = self._clean_text(description_elem.text)
            
            # Images
            image_elems = soup.select(".carousel-item img")
            car_details["images"] = []
            for img in image_elems:
                src = img.get("src") or img.get("data-src")
                if src:
                    car_details["images"].append(src)
            
            # Caractéristiques techniques
            features = {}
            spec_elems = soup.select(".optionsList li")
            for spec in spec_elems:
                label_elem = spec.select_one(".optionsList_label")
                value_elem = spec.select_one(".optionsList_value")
                
                if label_elem and value_elem:
                    label = self._clean_text(label_elem.text)
                    value = self._clean_text(value_elem.text)
                    features[label] = value
            
            car_details["features"] = features
            
            # Informations sur le vendeur
            seller_type_elem = soup.select_one(".sellerInfos_type")
            if seller_type_elem:
                car_details["seller_type"] = self._clean_text(seller_type_elem.text)
            
            seller_name_elem = soup.select_one(".sellerInfos_name")
            if seller_name_elem:
                car_details["seller_name"] = self._clean_text(seller_name_elem.text)
            
            seller_phone_elem = soup.select_one(".sellerInfos_phone")
            if seller_phone_elem:
                car_details["seller_phone"] = self._clean_text(seller_phone_elem.text)
            
            return car_details
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping des détails de l'annonce {url}: {str(e)}")
            return None 