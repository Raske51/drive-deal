#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour la gestion des annonces de voitures
"""

import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import re

from ..models import (
    Car, CarCreate, CarUpdate, CarResponse, CarsListResponse,
    PriceAnalysis, SimilarCarsResponse
)

logger = logging.getLogger(__name__)

class CarService:
    """
    Service pour la gestion des annonces de voitures
    """
    
    async def get_cars(
        self,
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at_desc",
        filters: Dict[str, Any] = None,
        user_id: Optional[str] = None
    ) -> CarsListResponse:
        """
        Récupère une liste d'annonces de voitures avec pagination et filtres
        """
        skip = (page - 1) * page_size
        
        # Construction du filtre
        query = {}
        if filters:
            if "brand" in filters and filters["brand"]:
                query["brand"] = {"$regex": f"^{re.escape(filters['brand'])}", "$options": "i"}
            
            if "model" in filters and filters["model"]:
                query["model"] = {"$regex": f"^{re.escape(filters['model'])}", "$options": "i"}
            
            if "price_min" in filters and filters["price_min"] is not None:
                query.setdefault("price", {})
                query["price"]["$gte"] = filters["price_min"]
            
            if "price_max" in filters and filters["price_max"] is not None:
                query.setdefault("price", {})
                query["price"]["$lte"] = filters["price_max"]
            
            if "year_min" in filters and filters["year_min"] is not None:
                query.setdefault("year", {})
                query["year"]["$gte"] = filters["year_min"]
            
            if "year_max" in filters and filters["year_max"] is not None:
                query.setdefault("year", {})
                query["year"]["$lte"] = filters["year_max"]
            
            if "mileage_min" in filters and filters["mileage_min"] is not None:
                query.setdefault("mileage", {})
                query["mileage"]["$gte"] = filters["mileage_min"]
            
            if "mileage_max" in filters and filters["mileage_max"] is not None:
                query.setdefault("mileage", {})
                query["mileage"]["$lte"] = filters["mileage_max"]
            
            if "fuel_type" in filters and filters["fuel_type"]:
                query["fuel_type"] = filters["fuel_type"]
            
            if "transmission" in filters and filters["transmission"]:
                query["transmission"] = filters["transmission"]
            
            if "location" in filters and filters["location"]:
                query["location"] = {"$regex": f".*{re.escape(filters['location'])}.*", "$options": "i"}
            
            if "source" in filters and filters["source"]:
                query["source"] = filters["source"]
            
            if "good_deals_only" in filters and filters["good_deals_only"]:
                query["is_good_deal"] = True
            
            if "keywords" in filters and filters["keywords"]:
                keywords = filters["keywords"].split()
                keyword_conditions = []
                for keyword in keywords:
                    keyword_conditions.append({
                        "$or": [
                            {"title": {"$regex": f".*{re.escape(keyword)}.*", "$options": "i"}},
                            {"description": {"$regex": f".*{re.escape(keyword)}.*", "$options": "i"}}
                        ]
                    })
                if keyword_conditions:
                    query["$and"] = keyword_conditions
        
        # Déterminer le tri
        sort_parts = sort_by.split("_")
        sort_field = "_".join(sort_parts[:-1]) if len(sort_parts) > 1 else sort_parts[0]
        sort_direction = 1 if sort_by.endswith("_asc") else -1
        
        # Mapper les champs de tri
        sort_field_map = {
            "created": "created_at",
            "price": "price",
            "year": "year",
            "mileage": "mileage",
            "relevance": "score"  # Pour la recherche par pertinence
        }
        
        sort_field = sort_field_map.get(sort_field, "created_at")
        sort_criteria = [(sort_field, sort_direction)]
        
        # Exécuter la requête
        total = await db.cars.count_documents(query)
        cursor = db.cars.find(query).sort(sort_criteria).skip(skip).limit(page_size)
        
        # Convertir les résultats en objets Car
        cars = []
        async for car_doc in cursor:
            car = await self._document_to_car(car_doc)
            cars.append(car)
        
        # Calculer le nombre total de pages
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        
        # Retourner la réponse
        return CarsListResponse(
            items=cars,
            total=total,
            page=page,
            page_size=page_size,
            pages=total_pages
        )
    
    async def get_car_by_id(
        self,
        db: AsyncIOMotorDatabase,
        car_id: str,
        include_similar: bool = True,
        include_price_analysis: bool = True,
        user_id: Optional[str] = None
    ) -> Optional[CarResponse]:
        """
        Récupère une annonce de voiture par son ID
        """
        try:
            car_doc = await db.cars.find_one({"_id": ObjectId(car_id)})
            if not car_doc:
                return None
            
            car = await self._document_to_car(car_doc)
            
            similar_cars = None
            price_analysis = None
            
            # Récupérer les annonces similaires si demandé
            if include_similar:
                similar_cars = await self._get_similar_cars(db, car)
            
            # Récupérer l'analyse de prix si demandée
            if include_price_analysis:
                price_analysis = await self._get_price_analysis(db, car)
            
            # Vérifier si l'annonce est dans les favoris de l'utilisateur
            is_favorite = False
            if user_id:
                favorite = await db.favorites.find_one({
                    "user_id": ObjectId(user_id),
                    "car_id": ObjectId(car_id)
                })
                is_favorite = favorite is not None
            
            return CarResponse(
                car=car,
                similar_cars=similar_cars,
                price_analysis=price_analysis,
                is_favorite=is_favorite
            )
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'annonce {car_id}: {str(e)}")
            return None
    
    async def create_car(
        self,
        db: AsyncIOMotorDatabase,
        car_data: CarCreate
    ) -> Optional[Car]:
        """
        Crée une nouvelle annonce de voiture
        """
        try:
            # Préparer les données pour l'insertion
            car_dict = car_data.model_dump(exclude_unset=True)
            car_dict["created_at"] = datetime.utcnow()
            car_dict["updated_at"] = car_dict["created_at"]
            
            # Déterminer si c'est une bonne affaire
            car_dict["is_good_deal"] = await self._is_good_deal(db, car_data)
            
            # Insérer dans la base de données
            result = await db.cars.insert_one(car_dict)
            
            # Récupérer l'annonce créée
            car_doc = await db.cars.find_one({"_id": result.inserted_id})
            return await self._document_to_car(car_doc)
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'annonce: {str(e)}")
            return None
    
    async def update_car(
        self,
        db: AsyncIOMotorDatabase,
        car_id: str,
        car_data: CarUpdate
    ) -> Optional[Car]:
        """
        Met à jour une annonce de voiture existante
        """
        try:
            # Vérifier si l'annonce existe
            car_doc = await db.cars.find_one({"_id": ObjectId(car_id)})
            if not car_doc:
                return None
            
            # Préparer les données pour la mise à jour
            update_data = car_data.model_dump(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            # Mettre à jour l'indicateur de bonne affaire si nécessaire
            if any(field in update_data for field in ["price", "year", "mileage"]):
                # Récupérer les données complètes de l'annonce
                current_car = await self._document_to_car(car_doc)
                # Mettre à jour avec les nouvelles valeurs
                updated_car_data = current_car.model_copy(update=update_data)
                # Recalculer si c'est une bonne affaire
                update_data["is_good_deal"] = await self._is_good_deal(db, updated_car_data)
            
            # Mettre à jour dans la base de données
            await db.cars.update_one(
                {"_id": ObjectId(car_id)},
                {"$set": update_data}
            )
            
            # Récupérer l'annonce mise à jour
            updated_car_doc = await db.cars.find_one({"_id": ObjectId(car_id)})
            return await self._document_to_car(updated_car_doc)
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'annonce {car_id}: {str(e)}")
            return None
    
    async def delete_car(
        self,
        db: AsyncIOMotorDatabase,
        car_id: str
    ) -> bool:
        """
        Supprime une annonce de voiture
        """
        try:
            result = await db.cars.delete_one({"_id": ObjectId(car_id)})
            
            # Supprimer également les références dans les favoris
            await db.favorites.delete_many({"car_id": ObjectId(car_id)})
            
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'annonce {car_id}: {str(e)}")
            return False
    
    async def get_brands(
        self,
        db: AsyncIOMotorDatabase
    ) -> List[str]:
        """
        Récupère la liste des marques disponibles
        """
        try:
            brands = await db.cars.distinct("brand")
            return sorted(brands)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des marques: {str(e)}")
            return []
    
    async def get_models(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None
    ) -> List[str]:
        """
        Récupère la liste des modèles disponibles, éventuellement filtrés par marque
        """
        try:
            query = {}
            if brand:
                query["brand"] = {"$regex": f"^{re.escape(brand)}", "$options": "i"}
            
            models = await db.cars.distinct("model", query)
            return sorted(models)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des modèles: {str(e)}")
            return []
    
    async def _document_to_car(self, doc: Dict[str, Any]) -> Car:
        """
        Convertit un document MongoDB en objet Car
        """
        doc["id"] = str(doc.pop("_id"))
        return Car(**doc)
    
    async def _get_similar_cars(
        self,
        db: AsyncIOMotorDatabase,
        car: Car
    ) -> SimilarCarsResponse:
        """
        Récupère des annonces similaires à une annonce donnée
        """
        try:
            # Construire la requête pour trouver des annonces similaires
            query = {
                "brand": car.brand,
                "model": car.model,
                "id": {"$ne": car.id},  # Exclure l'annonce actuelle
                "year": {"$gte": car.year - 2, "$lte": car.year + 2}  # Années similaires
            }
            
            # Ajouter des filtres sur le prix et le kilométrage
            price_range = 0.2  # 20% de variation
            query["price"] = {
                "$gte": car.price * (1 - price_range),
                "$lte": car.price * (1 + price_range)
            }
            
            if car.mileage:
                mileage_range = 0.3  # 30% de variation
                query["mileage"] = {
                    "$gte": car.mileage * (1 - mileage_range),
                    "$lte": car.mileage * (1 + mileage_range)
                }
            
            # Exécuter la requête
            cursor = db.cars.find(query).sort("price", 1).limit(5)
            
            # Convertir les résultats en objets Car
            similar_cars = []
            async for doc in cursor:
                similar_car = await self._document_to_car(doc)
                similar_cars.append(similar_car)
            
            # Calculer le prix moyen
            avg_price = sum(c.price for c in similar_cars) / len(similar_cars) if similar_cars else car.price
            
            return SimilarCarsResponse(
                cars=similar_cars,
                count=len(similar_cars),
                avg_price=avg_price
            )
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des annonces similaires: {str(e)}")
            return SimilarCarsResponse(cars=[], count=0, avg_price=car.price)
    
    async def _get_price_analysis(
        self,
        db: AsyncIOMotorDatabase,
        car: Car
    ) -> PriceAnalysis:
        """
        Analyse le prix d'une annonce par rapport au marché
        """
        try:
            # Construire la requête pour trouver des annonces comparables
            query = {
                "brand": car.brand,
                "model": car.model,
                "id": {"$ne": car.id}  # Exclure l'annonce actuelle
            }
            
            # Ajouter des filtres sur l'année et le kilométrage
            if car.year:
                query["year"] = {"$gte": car.year - 3, "$lte": car.year + 3}
            
            if car.mileage:
                query["mileage"] = {"$gte": 0, "$lte": car.mileage * 1.5}
            
            # Exécuter la requête
            cursor = db.cars.find(query)
            
            # Collecter les prix
            prices = []
            async for doc in cursor:
                prices.append(doc["price"])
            
            if not prices:
                return PriceAnalysis(
                    market_avg_price=car.price,
                    price_difference=0,
                    price_difference_percentage=0,
                    is_good_deal=False,
                    sample_size=0
                )
            
            # Calculer les statistiques
            market_avg_price = sum(prices) / len(prices)
            price_difference = market_avg_price - car.price
            price_difference_percentage = (price_difference / market_avg_price) * 100 if market_avg_price > 0 else 0
            
            # Déterminer si c'est une bonne affaire
            is_good_deal = price_difference_percentage >= 5  # Au moins 5% moins cher que la moyenne
            
            return PriceAnalysis(
                market_avg_price=market_avg_price,
                price_difference=price_difference,
                price_difference_percentage=price_difference_percentage,
                is_good_deal=is_good_deal,
                sample_size=len(prices)
            )
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du prix: {str(e)}")
            return PriceAnalysis(
                market_avg_price=car.price,
                price_difference=0,
                price_difference_percentage=0,
                is_good_deal=False,
                sample_size=0
            )
    
    async def _is_good_deal(
        self,
        db: AsyncIOMotorDatabase,
        car_data: Union[Car, CarCreate, Dict[str, Any]]
    ) -> bool:
        """
        Détermine si une annonce est une bonne affaire
        """
        try:
            # Convertir en dictionnaire si nécessaire
            if not isinstance(car_data, dict):
                car_dict = car_data.model_dump()
            else:
                car_dict = car_data
            
            # Construire la requête pour trouver des annonces comparables
            query = {
                "brand": car_dict["brand"],
                "model": car_dict["model"]
            }
            
            # Ajouter des filtres sur l'année et le kilométrage
            if "year" in car_dict and car_dict["year"]:
                query["year"] = {"$gte": car_dict["year"] - 3, "$lte": car_dict["year"] + 3}
            
            if "mileage" in car_dict and car_dict["mileage"]:
                query["mileage"] = {"$gte": 0, "$lte": car_dict["mileage"] * 1.5}
            
            # Exclure l'annonce actuelle si elle a un ID
            if "id" in car_dict and car_dict["id"]:
                query["_id"] = {"$ne": ObjectId(car_dict["id"])}
            
            # Exécuter la requête
            cursor = db.cars.find(query)
            
            # Collecter les prix
            prices = []
            async for doc in cursor:
                prices.append(doc["price"])
            
            if not prices:
                return False
            
            # Calculer la moyenne du marché
            market_avg_price = sum(prices) / len(prices)
            
            # Déterminer si c'est une bonne affaire
            price_difference_percentage = ((market_avg_price - car_dict["price"]) / market_avg_price) * 100 if market_avg_price > 0 else 0
            
            return price_difference_percentage >= 5  # Au moins 5% moins cher que la moyenne
        except Exception as e:
            logger.error(f"Erreur lors de la détermination si c'est une bonne affaire: {str(e)}")
            return False 