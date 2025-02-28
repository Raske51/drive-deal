#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour la gestion des annonces favorites
"""

import logging
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from ..models import Favorite, FavoriteCreate, FavoriteResponse, CarsListResponse

logger = logging.getLogger(__name__)

class FavoritesService:
    """
    Service pour la gestion des annonces favorites
    """
    
    async def add_favorite(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        favorite_data: FavoriteCreate
    ) -> Optional[FavoriteResponse]:
        """
        Ajoute une annonce aux favoris d'un utilisateur
        """
        try:
            # Vérifier si l'annonce existe
            car = await db.cars.find_one({"_id": ObjectId(favorite_data.car_id)})
            if not car:
                logger.warning(f"Tentative d'ajouter une annonce inexistante aux favoris: {favorite_data.car_id}")
                return None
            
            # Vérifier si l'annonce est déjà dans les favoris
            existing_favorite = await db.favorites.find_one({
                "user_id": ObjectId(user_id),
                "car_id": ObjectId(favorite_data.car_id)
            })
            
            if existing_favorite:
                # Mettre à jour la note et les commentaires si nécessaire
                update_data = {}
                if favorite_data.note:
                    update_data["note"] = favorite_data.note
                if favorite_data.comments:
                    update_data["comments"] = favorite_data.comments
                
                if update_data:
                    update_data["updated_at"] = datetime.utcnow()
                    await db.favorites.update_one(
                        {"_id": existing_favorite["_id"]},
                        {"$set": update_data}
                    )
                
                # Récupérer le favori mis à jour
                updated_favorite = await db.favorites.find_one({"_id": existing_favorite["_id"]})
                return await self._document_to_favorite_response(db, updated_favorite)
            
            # Créer un nouveau favori
            favorite_dict = {
                "user_id": ObjectId(user_id),
                "car_id": ObjectId(favorite_data.car_id),
                "note": favorite_data.note,
                "comments": favorite_data.comments,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insérer dans la base de données
            result = await db.favorites.insert_one(favorite_dict)
            
            # Récupérer le favori créé
            created_favorite = await db.favorites.find_one({"_id": result.inserted_id})
            return await self._document_to_favorite_response(db, created_favorite)
        
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'un favori: {str(e)}")
            return None
    
    async def get_favorites(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> CarsListResponse:
        """
        Récupère les annonces favorites d'un utilisateur
        """
        try:
            skip = (page - 1) * page_size
            
            # Récupérer les IDs des annonces favorites
            favorites_cursor = db.favorites.find(
                {"user_id": ObjectId(user_id)}
            ).sort("created_at", -1).skip(skip).limit(page_size)
            
            # Compter le nombre total de favoris
            total = await db.favorites.count_documents({"user_id": ObjectId(user_id)})
            
            # Récupérer les annonces correspondantes
            favorites = []
            car_ids = []
            favorites_map = {}
            
            async for favorite in favorites_cursor:
                car_ids.append(favorite["car_id"])
                favorites_map[str(favorite["car_id"])] = favorite
            
            # Si aucun favori, retourner une liste vide
            if not car_ids:
                return CarsListResponse(
                    items=[],
                    total=0,
                    page=page,
                    page_size=page_size,
                    pages=0
                )
            
            # Récupérer les annonces
            cars_cursor = db.cars.find({"_id": {"$in": car_ids}})
            
            # Convertir les résultats en objets Car avec les informations de favoris
            cars = []
            async for car_doc in cars_cursor:
                car_id = str(car_doc["_id"])
                car_doc["id"] = car_id
                del car_doc["_id"]
                
                # Ajouter les informations de favoris
                favorite = favorites_map.get(car_id)
                if favorite:
                    car_doc["favorite_id"] = str(favorite["_id"])
                    car_doc["favorite_note"] = favorite.get("note")
                    car_doc["favorite_comments"] = favorite.get("comments")
                    car_doc["favorite_created_at"] = favorite.get("created_at")
                
                from ..models import Car
                car = Car(**car_doc)
                cars.append(car)
            
            # Trier les voitures dans le même ordre que les favoris
            cars.sort(key=lambda car: car_ids.index(ObjectId(car.id)))
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            return CarsListResponse(
                items=cars,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des favoris: {str(e)}")
            return CarsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def get_favorite(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        favorite_id: str
    ) -> Optional[FavoriteResponse]:
        """
        Récupère un favori spécifique
        """
        try:
            # Récupérer le favori
            favorite = await db.favorites.find_one({
                "_id": ObjectId(favorite_id),
                "user_id": ObjectId(user_id)
            })
            
            if not favorite:
                return None
            
            return await self._document_to_favorite_response(db, favorite)
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du favori {favorite_id}: {str(e)}")
            return None
    
    async def update_favorite(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        favorite_id: str,
        favorite_data: FavoriteCreate
    ) -> Optional[FavoriteResponse]:
        """
        Met à jour un favori
        """
        try:
            # Vérifier si le favori existe et appartient à l'utilisateur
            favorite = await db.favorites.find_one({
                "_id": ObjectId(favorite_id),
                "user_id": ObjectId(user_id)
            })
            
            if not favorite:
                return None
            
            # Préparer les données à mettre à jour
            update_data = {
                "note": favorite_data.note,
                "comments": favorite_data.comments,
                "updated_at": datetime.utcnow()
            }
            
            # Si l'ID de l'annonce a changé, vérifier si la nouvelle annonce existe
            if str(favorite["car_id"]) != favorite_data.car_id:
                car = await db.cars.find_one({"_id": ObjectId(favorite_data.car_id)})
                if not car:
                    logger.warning(f"Tentative de mettre à jour un favori avec une annonce inexistante: {favorite_data.car_id}")
                    return None
                
                update_data["car_id"] = ObjectId(favorite_data.car_id)
            
            # Mettre à jour le favori
            await db.favorites.update_one(
                {"_id": ObjectId(favorite_id)},
                {"$set": update_data}
            )
            
            # Récupérer le favori mis à jour
            updated_favorite = await db.favorites.find_one({"_id": ObjectId(favorite_id)})
            return await self._document_to_favorite_response(db, updated_favorite)
        
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du favori {favorite_id}: {str(e)}")
            return None
    
    async def delete_favorite(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        favorite_id: str
    ) -> bool:
        """
        Supprime un favori
        """
        try:
            result = await db.favorites.delete_one({
                "_id": ObjectId(favorite_id),
                "user_id": ObjectId(user_id)
            })
            
            return result.deleted_count > 0
        
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du favori {favorite_id}: {str(e)}")
            return False
    
    async def is_favorite(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        car_id: str
    ) -> bool:
        """
        Vérifie si une annonce est dans les favoris d'un utilisateur
        """
        try:
            favorite = await db.favorites.find_one({
                "user_id": ObjectId(user_id),
                "car_id": ObjectId(car_id)
            })
            
            return favorite is not None
        
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du favori: {str(e)}")
            return False
    
    async def _document_to_favorite_response(
        self,
        db: AsyncIOMotorDatabase,
        doc: dict
    ) -> FavoriteResponse:
        """
        Convertit un document MongoDB en objet FavoriteResponse
        """
        # Récupérer l'annonce associée
        car = await db.cars.find_one({"_id": doc["car_id"]})
        
        car_data = None
        if car:
            car["id"] = str(car["_id"])
            del car["_id"]
            from ..models import Car
            car_data = Car(**car)
        
        return FavoriteResponse(
            id=str(doc["_id"]),
            user_id=str(doc["user_id"]),
            car_id=str(doc["car_id"]),
            note=doc.get("note"),
            comments=doc.get("comments"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            car=car_data
        ) 