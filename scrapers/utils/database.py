#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Module de gestion de base de données pour le scraper de véhicules
Supporte l'export en JSON, CSV et le stockage en base de données MySQL/SQLite
"""

import os
import json
import logging
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("CarScraper.Database")

Base = declarative_base()

class Car(Base):
    """Modèle SQLAlchemy pour les annonces de véhicules"""
    __tablename__ = 'cars'
    
    id = Column(String(100), primary_key=True)
    source = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    brand = Column(String(100))
    model = Column(String(100))
    year = Column(Integer)
    price = Column(Float)
    mileage = Column(Integer)
    fuel_type = Column(String(50))
    transmission = Column(String(50))
    location = Column(String(255))
    description = Column(Text)
    url = Column(String(500))
    images = Column(JSON)
    local_images = Column(JSON)
    features = Column(JSON)
    seller_type = Column(String(50))
    seller_name = Column(String(100))
    seller_phone = Column(String(50))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    def __repr__(self):
        return f"<Car(id='{self.id}', brand='{self.brand}', model='{self.model}', year={self.year}, price={self.price})>"

class DatabaseManager:
    """Gestionnaire de base de données pour le stockage des annonces"""
    
    def __init__(self, config):
        """Initialisation du gestionnaire de base de données"""
        self.config = config
        self.db_type = config.get("type", "json")
        self.engine = None
        self.session = None
        
        if self.db_type in ["mysql", "sqlite"]:
            self._setup_database()
    
    def _setup_database(self):
        """Configure la connexion à la base de données"""
        try:
            if self.db_type == "mysql":
                mysql_config = self.config.get("mysql_config", {})
                connection_string = f"mysql+pymysql://{mysql_config.get('user')}:{mysql_config.get('password')}@{mysql_config.get('host')}/{mysql_config.get('database')}"
                self.engine = create_engine(connection_string)
            else:  # sqlite
                db_path = self.config.get("path", "scrapers/data/cars.db").replace(".json", ".db")
                self.engine = create_engine(f"sqlite:///{db_path}")
            
            # Créer les tables si elles n'existent pas
            Base.metadata.create_all(self.engine)
            
            # Créer une session
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
            
            logger.info(f"Connexion à la base de données {self.db_type} établie")
            
        except Exception as e:
            logger.error(f"Erreur lors de la connexion à la base de données: {str(e)}")
            # Fallback to JSON
            self.db_type = "json"
    
    def save_cars(self, cars, source):
        """Sauvegarde les annonces dans la base de données"""
        if not cars:
            logger.warning(f"Aucune annonce à sauvegarder pour {source}")
            return
        
        try:
            if self.db_type in ["mysql", "sqlite"]:
                self._save_to_database(cars, source)
            else:
                self._save_to_json(cars, source)
                
            logger.info(f"{len(cars)} annonces sauvegardées depuis {source}")
            
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde des annonces: {str(e)}")
    
    def _save_to_database(self, cars, source):
        """Sauvegarde les annonces dans une base de données SQL"""
        for car_data in cars:
            # Ajouter la source
            car_data["source"] = source
            
            # Vérifier si l'annonce existe déjà
            existing_car = self.session.query(Car).filter_by(id=car_data.get("id")).first()
            
            if existing_car:
                # Mettre à jour l'annonce existante
                for key, value in car_data.items():
                    if hasattr(existing_car, key):
                        setattr(existing_car, key, value)
            else:
                # Créer une nouvelle annonce
                car = Car(**car_data)
                self.session.add(car)
        
        # Commit les changements
        self.session.commit()
    
    def _save_to_json(self, cars, source):
        """Sauvegarde les annonces dans un fichier JSON"""
        json_path = self.config.get("path", "scrapers/data/cars.json")
        
        # Créer le répertoire si nécessaire
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        
        # Charger les données existantes
        existing_data = {}
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Fichier JSON corrompu: {json_path}, création d'un nouveau fichier")
        
        # Ajouter ou mettre à jour les annonces
        for car in cars:
            car["source"] = source
            car["updated_at"] = datetime.now().isoformat()
            
            if "id" in car:
                existing_data[car["id"]] = car
            else:
                # Générer un ID unique si non fourni
                car_id = f"{source}_{datetime.now().timestamp()}_{len(existing_data)}"
                car["id"] = car_id
                existing_data[car_id] = car
        
        # Sauvegarder les données
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
    
    def export_data(self, format="json", output_path=None):
        """Exporte les données dans le format spécifié"""
        try:
            if self.db_type in ["mysql", "sqlite"]:
                # Récupérer toutes les annonces
                cars = self.session.query(Car).all()
                # Convertir en dictionnaire
                cars_dict = {car.id: {c.name: getattr(car, c.name) for c in car.__table__.columns} for car in cars}
            else:
                # Charger depuis le fichier JSON
                json_path = self.config.get("path", "scrapers/data/cars.json")
                if not os.path.exists(json_path):
                    logger.error(f"Fichier JSON non trouvé: {json_path}")
                    return None
                
                with open(json_path, 'r', encoding='utf-8') as f:
                    cars_dict = json.load(f)
            
            # Exporter selon le format
            if format == "json":
                if not output_path:
                    output_path = f"scrapers/data/export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(cars_dict, f, ensure_ascii=False, indent=2)
                
            elif format == "csv":
                if not output_path:
                    output_path = f"scrapers/data/export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                
                # Convertir en DataFrame
                df = pd.DataFrame.from_dict(cars_dict, orient='index')
                
                # Gérer les colonnes de type liste/dict
                for col in df.columns:
                    if df[col].apply(lambda x: isinstance(x, (list, dict))).any():
                        df[col] = df[col].apply(lambda x: json.dumps(x) if isinstance(x, (list, dict)) else x)
                
                # Exporter en CSV
                df.to_csv(output_path, index=False, encoding='utf-8')
            
            logger.info(f"Données exportées avec succès vers {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Erreur lors de l'exportation des données: {str(e)}")
            return None
    
    def get_cars(self, filters=None):
        """Récupère les annonces selon les filtres spécifiés"""
        try:
            if self.db_type in ["mysql", "sqlite"]:
                query = self.session.query(Car)
                
                if filters:
                    for key, value in filters.items():
                        if hasattr(Car, key):
                            query = query.filter(getattr(Car, key) == value)
                
                return query.all()
            else:
                # Charger depuis le fichier JSON
                json_path = self.config.get("path", "scrapers/data/cars.json")
                if not os.path.exists(json_path):
                    logger.error(f"Fichier JSON non trouvé: {json_path}")
                    return []
                
                with open(json_path, 'r', encoding='utf-8') as f:
                    cars_dict = json.load(f)
                
                # Filtrer les annonces
                if filters:
                    filtered_cars = {}
                    for car_id, car in cars_dict.items():
                        match = True
                        for key, value in filters.items():
                            if key in car and car[key] != value:
                                match = False
                                break
                        
                        if match:
                            filtered_cars[car_id] = car
                    
                    return list(filtered_cars.values())
                
                return list(cars_dict.values())
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des annonces: {str(e)}")
            return [] 