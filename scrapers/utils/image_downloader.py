#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Module de téléchargement d'images pour le scraper de véhicules
Permet de télécharger et stocker les images des annonces
"""

import os
import time
import logging
import requests
import hashlib
from PIL import Image
from io import BytesIO
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

logger = logging.getLogger("CarScraper.ImageDownloader")

class ImageDownloader:
    """Téléchargeur d'images pour les annonces de véhicules"""
    
    def __init__(self, download_path="scrapers/data/images", max_images=10, max_workers=4):
        """Initialisation du téléchargeur d'images"""
        self.download_path = download_path
        self.max_images = max_images
        self.max_workers = max_workers
        
        # Créer le répertoire de téléchargement s'il n'existe pas
        os.makedirs(download_path, exist_ok=True)
    
    def download_images(self, image_urls, car_id):
        """Télécharge les images d'une annonce"""
        if not image_urls:
            logger.warning(f"Aucune image à télécharger pour l'annonce {car_id}")
            return []
        
        # Limiter le nombre d'images à télécharger
        image_urls = image_urls[:self.max_images]
        
        # Créer un répertoire spécifique pour cette annonce
        car_dir = os.path.join(self.download_path, str(car_id))
        os.makedirs(car_dir, exist_ok=True)
        
        logger.info(f"Téléchargement de {len(image_urls)} images pour l'annonce {car_id}")
        
        # Télécharger les images en parallèle
        local_images = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {executor.submit(self._download_image, url, car_dir, idx): url 
                      for idx, url in enumerate(image_urls)}
            
            for future in tqdm(futures, desc=f"Téléchargement des images pour {car_id}", unit="image"):
                try:
                    result = future.result()
                    if result:
                        local_images.append(result)
                except Exception as e:
                    logger.error(f"Erreur lors du téléchargement d'une image: {str(e)}")
        
        return local_images
    
    def _download_image(self, url, car_dir, idx):
        """Télécharge une image et la sauvegarde"""
        try:
            # Générer un nom de fichier unique basé sur l'URL
            url_hash = hashlib.md5(url.encode()).hexdigest()
            parsed_url = urlparse(url)
            file_ext = os.path.splitext(parsed_url.path)[1]
            
            # Si l'extension n'est pas valide, utiliser .jpg par défaut
            if not file_ext or file_ext.lower() not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
                file_ext = '.jpg'
            
            filename = f"{idx+1:02d}_{url_hash[:8]}{file_ext}"
            filepath = os.path.join(car_dir, filename)
            
            # Vérifier si l'image existe déjà
            if os.path.exists(filepath):
                logger.debug(f"L'image {filename} existe déjà")
                return filepath
            
            # Télécharger l'image
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Traiter l'image avec PIL pour vérifier qu'elle est valide
            img = Image.open(BytesIO(response.content))
            
            # Convertir les images WebP en JPEG pour une meilleure compatibilité
            if file_ext.lower() == '.webp':
                img = img.convert('RGB')
                filepath = filepath.replace('.webp', '.jpg')
            
            # Sauvegarder l'image
            img.save(filepath)
            
            # Ajouter un délai pour éviter de surcharger le serveur
            time.sleep(0.5)
            
            return filepath
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la requête pour l'image {url}: {str(e)}")
        except Exception as e:
            logger.error(f"Erreur lors du traitement de l'image {url}: {str(e)}")
        
        return None
    
    def optimize_images(self, car_id, quality=85, max_width=1200):
        """Optimise les images téléchargées pour réduire leur taille"""
        car_dir = os.path.join(self.download_path, str(car_id))
        
        if not os.path.exists(car_dir):
            logger.warning(f"Répertoire d'images non trouvé pour l'annonce {car_id}")
            return
        
        logger.info(f"Optimisation des images pour l'annonce {car_id}")
        
        for filename in os.listdir(car_dir):
            filepath = os.path.join(car_dir, filename)
            
            try:
                # Ouvrir l'image
                img = Image.open(filepath)
                
                # Redimensionner si nécessaire
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.LANCZOS)
                
                # Convertir en RGB si nécessaire (pour les images avec canal alpha)
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                
                # Sauvegarder avec compression
                img.save(filepath, quality=quality, optimize=True)
                
            except Exception as e:
                logger.error(f"Erreur lors de l'optimisation de l'image {filepath}: {str(e)}")
    
    def clean_unused_images(self, active_car_ids):
        """Supprime les images des annonces qui ne sont plus actives"""
        if not os.path.exists(self.download_path):
            return
        
        # Convertir en ensemble pour une recherche plus rapide
        active_car_ids = set(str(car_id) for car_id in active_car_ids)
        
        for car_dir in os.listdir(self.download_path):
            car_path = os.path.join(self.download_path, car_dir)
            
            # Vérifier si c'est un répertoire et si l'annonce n'est plus active
            if os.path.isdir(car_path) and car_dir not in active_car_ids:
                try:
                    # Supprimer les images
                    for filename in os.listdir(car_path):
                        os.remove(os.path.join(car_path, filename))
                    
                    # Supprimer le répertoire
                    os.rmdir(car_path)
                    
                    logger.info(f"Images supprimées pour l'annonce inactive {car_dir}")
                    
                except Exception as e:
                    logger.error(f"Erreur lors de la suppression des images pour {car_dir}: {str(e)}") 