#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Classe de base pour les scrapers de véhicules
Définit l'interface commune et les fonctionnalités partagées par tous les scrapers
"""

import time
import random
import logging
import requests
from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from fake_useragent import UserAgent

logger = logging.getLogger("CarScraper.BaseScraper")

class BaseScraper(ABC):
    """Classe de base pour les scrapers de véhicules"""
    
    def __init__(self, config):
        """Initialisation du scraper"""
        self.config = config
        self.driver = None
        self.session = None
        self.user_agent = self._get_user_agent()
        self.scraping_config = config.get("scraping", {})
        self.search_params = config.get("search_params", {})
        
    def _get_user_agent(self):
        """Retourne un User-Agent aléatoire"""
        try:
            ua = UserAgent()
            return ua.random
        except Exception:
            # Fallback sur une liste prédéfinie
            user_agents = self.config.get("user_agents", [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
            ])
            return random.choice(user_agents)
    
    def _init_selenium(self):
        """Initialise le navigateur Selenium"""
        try:
            chrome_options = Options()
            
            # Mode headless si configuré
            if self.scraping_config.get("headless", True):
                chrome_options.add_argument("--headless")
            
            # Autres options pour éviter la détection
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument(f"user-agent={self.user_agent}")
            
            # Désactiver les images pour accélérer le chargement
            chrome_options.add_argument("--blink-settings=imagesEnabled=false")
            
            # Utiliser un proxy si configuré
            if self.config.get("proxy", {}).get("use_proxy", False):
                proxy_list = self.config.get("proxy", {}).get("proxy_list", [])
                if proxy_list:
                    proxy = random.choice(proxy_list)
                    chrome_options.add_argument(f"--proxy-server={proxy}")
            
            # Initialiser le driver
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Configurer le timeout
            self.driver.set_page_load_timeout(self.scraping_config.get("timeout", 30))
            
            logger.info("Navigateur Selenium initialisé avec succès")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de Selenium: {str(e)}")
            raise
    
    def _init_requests(self):
        """Initialise la session requests"""
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        })
        
        # Utiliser un proxy si configuré
        if self.config.get("proxy", {}).get("use_proxy", False):
            proxy_list = self.config.get("proxy", {}).get("proxy_list", [])
            if proxy_list:
                proxy = random.choice(proxy_list)
                self.session.proxies = {
                    "http": proxy,
                    "https": proxy
                }
        
        logger.info("Session requests initialisée avec succès")
    
    def _wait_between_requests(self):
        """Ajoute un délai aléatoire entre les requêtes pour éviter la détection"""
        delay = self.scraping_config.get("delay_between_requests", 2)
        jitter = random.uniform(0.5, 1.5)
        time.sleep(delay * jitter)
    
    def _safe_get(self, url, retries=None):
        """Effectue une requête GET avec gestion des erreurs et des retries"""
        if retries is None:
            retries = self.scraping_config.get("max_retries", 3)
        
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=self.scraping_config.get("timeout", 30))
                response.raise_for_status()
                return response
            except requests.exceptions.RequestException as e:
                logger.warning(f"Erreur lors de la requête (tentative {attempt+1}/{retries}): {str(e)}")
                if attempt == retries - 1:
                    logger.error(f"Échec de la requête après {retries} tentatives: {url}")
                    raise
                time.sleep(2 * (attempt + 1))  # Backoff exponentiel
        
        return None
    
    def _safe_get_selenium(self, url, retries=None):
        """Navigue vers une URL avec Selenium avec gestion des erreurs et des retries"""
        if self.driver is None:
            self._init_selenium()
        
        if retries is None:
            retries = self.scraping_config.get("max_retries", 3)
        
        for attempt in range(retries):
            try:
                self.driver.get(url)
                return True
            except (TimeoutException, WebDriverException) as e:
                logger.warning(f"Erreur lors de la navigation (tentative {attempt+1}/{retries}): {str(e)}")
                if attempt == retries - 1:
                    logger.error(f"Échec de la navigation après {retries} tentatives: {url}")
                    return False
                time.sleep(2 * (attempt + 1))  # Backoff exponentiel
        
        return False
    
    def _wait_for_element(self, selector, by=By.CSS_SELECTOR, timeout=None):
        """Attend qu'un élément soit présent dans la page"""
        if timeout is None:
            timeout = self.scraping_config.get("timeout", 30)
        
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            return element
        except TimeoutException:
            logger.warning(f"Timeout en attendant l'élément: {selector}")
            return None
    
    def _wait_for_elements(self, selector, by=By.CSS_SELECTOR, timeout=None):
        """Attend que des éléments soient présents dans la page"""
        if timeout is None:
            timeout = self.scraping_config.get("timeout", 30)
        
        try:
            elements = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_all_elements_located((by, selector))
            )
            return elements
        except TimeoutException:
            logger.warning(f"Timeout en attendant les éléments: {selector}")
            return []
    
    def _scroll_to_bottom(self, scroll_pause_time=1.0, max_scrolls=None):
        """Fait défiler la page jusqu'en bas pour charger le contenu dynamique"""
        # Hauteur initiale
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        scrolls = 0
        
        while True:
            # Défiler vers le bas
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            
            # Attendre le chargement
            time.sleep(scroll_pause_time)
            
            # Calculer la nouvelle hauteur
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            
            # Si la hauteur n'a pas changé, on a atteint le bas
            if new_height == last_height:
                break
            
            last_height = new_height
            scrolls += 1
            
            # Limiter le nombre de défilements si spécifié
            if max_scrolls and scrolls >= max_scrolls:
                break
    
    def _clean_text(self, text):
        """Nettoie un texte (supprime les espaces superflus, etc.)"""
        if not text:
            return ""
        
        return " ".join(text.strip().split())
    
    def _extract_number(self, text):
        """Extrait un nombre d'une chaîne de caractères"""
        if not text:
            return None
        
        # Supprimer les caractères non numériques
        digits = "".join(c for c in text if c.isdigit() or c == ".")
        
        try:
            return float(digits) if "." in digits else int(digits)
        except ValueError:
            return None
    
    def _close(self):
        """Ferme le navigateur et la session"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.error(f"Erreur lors de la fermeture du navigateur: {str(e)}")
            finally:
                self.driver = None
        
        if self.session:
            try:
                self.session.close()
            except Exception as e:
                logger.error(f"Erreur lors de la fermeture de la session: {str(e)}")
            finally:
                self.session = None
    
    def scrape(self):
        """Méthode principale pour le scraping"""
        try:
            # Initialiser les sessions
            self._init_requests()
            
            # Exécuter le scraping
            cars = self._scrape_listings()
            
            logger.info(f"Scraping terminé avec succès: {len(cars)} annonces récupérées")
            
            return cars
            
        except Exception as e:
            logger.error(f"Erreur lors du scraping: {str(e)}")
            raise
        finally:
            # Fermer les sessions
            self._close()
    
    @abstractmethod
    def _scrape_listings(self):
        """Méthode abstraite à implémenter par les sous-classes pour scraper les annonces"""
        pass
    
    @abstractmethod
    def _scrape_car_details(self, url):
        """Méthode abstraite à implémenter par les sous-classes pour scraper les détails d'une annonce"""
        pass 