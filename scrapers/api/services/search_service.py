#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour la recherche d'annonces de voitures
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
import re

from ..models import (
    Car, CarsListResponse, SearchQuery, SearchSuggestion
)

logger = logging.getLogger(__name__)

class SearchService:
    """
    Service pour la recherche d'annonces de voitures
    """
    
    async def search(
        self,
        db: AsyncIOMotorDatabase,
        query: SearchQuery,
        page: int = 1,
        page_size: int = 20,
        user_id: Optional[str] = None
    ) -> CarsListResponse:
        """
        Recherche des annonces de voitures selon les critères spécifiés
        """
        try:
            skip = (page - 1) * page_size
            
            # Construction de la requête de recherche
            search_query = self._build_search_query(query)
            
            # Exécuter la requête
            total = await db.cars.count_documents(search_query)
            
            # Déterminer le tri
            sort_criteria = self._get_sort_criteria(query.sort_by)
            
            # Récupérer les résultats
            cursor = db.cars.find(search_query).sort(sort_criteria).skip(skip).limit(page_size)
            
            # Convertir les résultats en objets Car
            cars = []
            async for car_doc in cursor:
                car_doc["id"] = str(car_doc.pop("_id"))
                car = Car(**car_doc)
                cars.append(car)
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            # Enregistrer la recherche si un utilisateur est spécifié
            if user_id:
                await self._record_search(db, query, user_id, total)
            
            # Retourner la réponse
            return CarsListResponse(
                items=cars,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        except Exception as e:
            logger.error(f"Erreur lors de la recherche: {str(e)}")
            return CarsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def get_suggestions(
        self,
        db: AsyncIOMotorDatabase,
        prefix: str,
        type: str = "brand",
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Récupère des suggestions pour l'autocomplétion
        """
        try:
            suggestions = []
            
            if not prefix or len(prefix) < 2:
                return suggestions
            
            # Échapper les caractères spéciaux dans le préfixe
            escaped_prefix = re.escape(prefix)
            
            if type == "brand":
                # Rechercher des marques
                cursor = db.cars.aggregate([
                    {"$match": {"brand": {"$regex": f"^{escaped_prefix}", "$options": "i"}}},
                    {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": limit}
                ])
                
                async for doc in cursor:
                    suggestions.append(SearchSuggestion(
                        text=doc["_id"],
                        type="brand",
                        count=doc["count"]
                    ))
            
            elif type == "model":
                # Rechercher des modèles
                cursor = db.cars.aggregate([
                    {"$match": {"model": {"$regex": f"^{escaped_prefix}", "$options": "i"}}},
                    {"$group": {"_id": "$model", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": limit}
                ])
                
                async for doc in cursor:
                    suggestions.append(SearchSuggestion(
                        text=doc["_id"],
                        type="model",
                        count=doc["count"]
                    ))
            
            elif type == "location":
                # Rechercher des localisations
                cursor = db.cars.aggregate([
                    {"$match": {"location": {"$regex": f".*{escaped_prefix}.*", "$options": "i"}}},
                    {"$group": {"_id": "$location", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": limit}
                ])
                
                async for doc in cursor:
                    suggestions.append(SearchSuggestion(
                        text=doc["_id"],
                        type="location",
                        count=doc["count"]
                    ))
            
            elif type == "keyword":
                # Rechercher dans les titres et descriptions
                title_cursor = db.cars.aggregate([
                    {"$match": {"title": {"$regex": f".*{escaped_prefix}.*", "$options": "i"}}},
                    {"$group": {"_id": "$title", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": limit // 2}
                ])
                
                async for doc in title_cursor:
                    # Extraire les mots-clés pertinents du titre
                    words = doc["_id"].split()
                    for word in words:
                        if len(word) > 3 and word.lower().startswith(prefix.lower()):
                            suggestions.append(SearchSuggestion(
                                text=word,
                                type="keyword",
                                count=doc["count"]
                            ))
                            break
                
                # Compléter avec des mots-clés de la description si nécessaire
                if len(suggestions) < limit:
                    desc_cursor = db.cars.aggregate([
                        {"$match": {"description": {"$regex": f".*{escaped_prefix}.*", "$options": "i"}}},
                        {"$group": {"_id": "$description", "count": {"$sum": 1}}},
                        {"$sort": {"count": -1}},
                        {"$limit": limit - len(suggestions)}
                    ])
                    
                    async for doc in desc_cursor:
                        # Extraire les mots-clés pertinents de la description
                        words = doc["_id"].split()
                        for word in words:
                            if len(word) > 3 and word.lower().startswith(prefix.lower()):
                                suggestions.append(SearchSuggestion(
                                    text=word,
                                    type="keyword",
                                    count=doc["count"]
                                ))
                                break
            
            # Dédupliquer les suggestions
            unique_suggestions = {}
            for suggestion in suggestions:
                if suggestion.text.lower() not in unique_suggestions:
                    unique_suggestions[suggestion.text.lower()] = suggestion
            
            return list(unique_suggestions.values())[:limit]
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des suggestions: {str(e)}")
            return []
    
    async def get_popular_searches(
        self,
        db: AsyncIOMotorDatabase,
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Récupère les recherches populaires
        """
        try:
            popular_searches = []
            
            # Récupérer les recherches les plus fréquentes
            cursor = db.search_history.aggregate([
                {"$group": {"_id": "$query_text", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ])
            
            async for doc in cursor:
                popular_searches.append(SearchSuggestion(
                    text=doc["_id"],
                    type="popular_search",
                    count=doc["count"]
                ))
            
            return popular_searches
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des recherches populaires: {str(e)}")
            return []
    
    async def get_recent_searches(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Récupère les recherches récentes d'un utilisateur
        """
        try:
            recent_searches = []
            
            # Récupérer les recherches récentes de l'utilisateur
            cursor = db.search_history.find(
                {"user_id": user_id}
            ).sort("timestamp", -1).limit(limit)
            
            async for doc in cursor:
                recent_searches.append(SearchSuggestion(
                    text=doc["query_text"],
                    type="recent_search",
                    count=1
                ))
            
            # Dédupliquer les recherches
            unique_searches = {}
            for search in recent_searches:
                if search.text not in unique_searches:
                    unique_searches[search.text] = search
            
            return list(unique_searches.values())
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des recherches récentes: {str(e)}")
            return []
    
    async def clear_recent_searches(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str
    ) -> bool:
        """
        Efface l'historique de recherche d'un utilisateur
        """
        try:
            result = await db.search_history.delete_many({"user_id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'historique de recherche: {str(e)}")
            return False
    
    def _build_search_query(self, query: SearchQuery) -> Dict[str, Any]:
        """
        Construit une requête MongoDB à partir d'un objet SearchQuery
        """
        search_query = {}
        
        # Ajouter les filtres de base
        if query.brand:
            search_query["brand"] = {"$regex": f"^{re.escape(query.brand)}", "$options": "i"}
        
        if query.model:
            search_query["model"] = {"$regex": f"^{re.escape(query.model)}", "$options": "i"}
        
        if query.price_min is not None:
            search_query.setdefault("price", {})
            search_query["price"]["$gte"] = query.price_min
        
        if query.price_max is not None:
            search_query.setdefault("price", {})
            search_query["price"]["$lte"] = query.price_max
        
        if query.year_min is not None:
            search_query.setdefault("year", {})
            search_query["year"]["$gte"] = query.year_min
        
        if query.year_max is not None:
            search_query.setdefault("year", {})
            search_query["year"]["$lte"] = query.year_max
        
        if query.mileage_min is not None:
            search_query.setdefault("mileage", {})
            search_query["mileage"]["$gte"] = query.mileage_min
        
        if query.mileage_max is not None:
            search_query.setdefault("mileage", {})
            search_query["mileage"]["$lte"] = query.mileage_max
        
        if query.fuel_type:
            search_query["fuel_type"] = query.fuel_type
        
        if query.transmission:
            search_query["transmission"] = query.transmission
        
        if query.location:
            search_query["location"] = {"$regex": f".*{re.escape(query.location)}.*", "$options": "i"}
        
        if query.source:
            search_query["source"] = query.source
        
        if query.good_deals_only:
            search_query["is_good_deal"] = True
        
        # Recherche par mots-clés
        if query.keywords:
            keywords = query.keywords.split()
            keyword_conditions = []
            for keyword in keywords:
                keyword_conditions.append({
                    "$or": [
                        {"title": {"$regex": f".*{re.escape(keyword)}.*", "$options": "i"}},
                        {"description": {"$regex": f".*{re.escape(keyword)}.*", "$options": "i"}}
                    ]
                })
            if keyword_conditions:
                search_query["$and"] = keyword_conditions
        
        return search_query
    
    def _get_sort_criteria(self, sort_by: str) -> List[tuple]:
        """
        Détermine les critères de tri
        """
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
        return [(sort_field, sort_direction)]
    
    async def _record_search(
        self,
        db: AsyncIOMotorDatabase,
        query: SearchQuery,
        user_id: str,
        results_count: int
    ) -> None:
        """
        Enregistre une recherche dans l'historique
        """
        try:
            # Construire une représentation textuelle de la recherche
            query_parts = []
            if query.keywords:
                query_parts.append(query.keywords)
            if query.brand:
                query_parts.append(query.brand)
            if query.model:
                query_parts.append(query.model)
            
            query_text = " ".join(query_parts) if query_parts else "Recherche sans critères"
            
            # Enregistrer la recherche
            search_record = {
                "user_id": user_id,
                "query_text": query_text,
                "query": query.model_dump(),
                "results_count": results_count,
                "timestamp": datetime.utcnow()
            }
            
            await db.search_history.insert_one(search_record)
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement de la recherche: {str(e)}") 