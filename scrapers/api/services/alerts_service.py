#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour la gestion des alertes sur les annonces
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import re

from ..models import (
    Alert, AlertCreate, AlertUpdate, AlertResponse,
    AlertMatch, AlertsListResponse, SearchQuery
)
from ..config import settings

logger = logging.getLogger(__name__)

class AlertsService:
    """
    Service pour la gestion des alertes sur les annonces
    """
    
    async def create_alert(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_data: AlertCreate
    ) -> Optional[AlertResponse]:
        """
        Crée une nouvelle alerte
        """
        try:
            # Vérifier le nombre d'alertes existantes pour l'utilisateur
            existing_alerts_count = await db.alerts.count_documents({"user_id": ObjectId(user_id)})
            
            if existing_alerts_count >= settings.max_alerts_per_user:
                logger.warning(f"L'utilisateur {user_id} a atteint le nombre maximum d'alertes")
                return None
            
            # Préparer les données de l'alerte
            alert_dict = alert_data.model_dump(exclude_unset=True)
            alert_dict["user_id"] = ObjectId(user_id)
            alert_dict["created_at"] = datetime.utcnow()
            alert_dict["updated_at"] = alert_dict["created_at"]
            alert_dict["last_run"] = None
            alert_dict["last_match_count"] = 0
            alert_dict["total_match_count"] = 0
            
            # Insérer l'alerte dans la base de données
            result = await db.alerts.insert_one(alert_dict)
            
            # Récupérer l'alerte créée
            created_alert = await db.alerts.find_one({"_id": result.inserted_id})
            
            return await self._document_to_alert_response(created_alert)
        
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'alerte: {str(e)}")
            return None
    
    async def get_alerts(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> AlertsListResponse:
        """
        Récupère les alertes d'un utilisateur
        """
        try:
            skip = (page - 1) * page_size
            
            # Récupérer les alertes
            cursor = db.alerts.find(
                {"user_id": ObjectId(user_id)}
            ).sort("created_at", -1).skip(skip).limit(page_size)
            
            # Compter le nombre total d'alertes
            total = await db.alerts.count_documents({"user_id": ObjectId(user_id)})
            
            # Convertir les résultats en objets Alert
            alerts = []
            async for doc in cursor:
                alert = await self._document_to_alert_response(doc)
                alerts.append(alert)
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            return AlertsListResponse(
                items=alerts,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des alertes: {str(e)}")
            return AlertsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def get_alert(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_id: str
    ) -> Optional[AlertResponse]:
        """
        Récupère une alerte spécifique
        """
        try:
            # Récupérer l'alerte
            alert = await db.alerts.find_one({
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            })
            
            if not alert:
                return None
            
            return await self._document_to_alert_response(alert)
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'alerte {alert_id}: {str(e)}")
            return None
    
    async def update_alert(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_id: str,
        alert_data: AlertUpdate
    ) -> Optional[AlertResponse]:
        """
        Met à jour une alerte
        """
        try:
            # Vérifier si l'alerte existe et appartient à l'utilisateur
            alert = await db.alerts.find_one({
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            })
            
            if not alert:
                return None
            
            # Préparer les données à mettre à jour
            update_data = alert_data.model_dump(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            # Mettre à jour l'alerte
            await db.alerts.update_one(
                {"_id": ObjectId(alert_id)},
                {"$set": update_data}
            )
            
            # Récupérer l'alerte mise à jour
            updated_alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})
            return await self._document_to_alert_response(updated_alert)
        
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'alerte {alert_id}: {str(e)}")
            return None
    
    async def delete_alert(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_id: str
    ) -> bool:
        """
        Supprime une alerte
        """
        try:
            result = await db.alerts.delete_one({
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            })
            
            if result.deleted_count > 0:
                # Supprimer également les correspondances d'alerte associées
                await db.alert_matches.delete_many({"alert_id": ObjectId(alert_id)})
                return True
            
            return False
        
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'alerte {alert_id}: {str(e)}")
            return False
    
    async def get_alert_matches(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_id: str,
        page: int = 1,
        page_size: int = 20,
        include_seen: bool = False
    ) -> List[AlertMatch]:
        """
        Récupère les correspondances d'une alerte
        """
        try:
            skip = (page - 1) * page_size
            
            # Vérifier si l'alerte existe et appartient à l'utilisateur
            alert = await db.alerts.find_one({
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            })
            
            if not alert:
                return []
            
            # Construire la requête
            query = {"alert_id": ObjectId(alert_id)}
            if not include_seen:
                query["seen"] = False
            
            # Récupérer les correspondances
            cursor = db.alert_matches.find(query).sort("created_at", -1).skip(skip).limit(page_size)
            
            # Convertir les résultats en objets AlertMatch
            matches = []
            car_ids = []
            
            async for match in cursor:
                car_ids.append(match["car_id"])
                matches.append({
                    "id": str(match["_id"]),
                    "alert_id": str(match["alert_id"]),
                    "car_id": str(match["car_id"]),
                    "created_at": match["created_at"],
                    "seen": match["seen"],
                    "car": None  # Sera rempli plus tard
                })
            
            # Si aucune correspondance, retourner une liste vide
            if not car_ids:
                return []
            
            # Récupérer les annonces correspondantes
            cars_cursor = db.cars.find({"_id": {"$in": car_ids}})
            
            # Créer un dictionnaire des annonces par ID
            cars_by_id = {}
            async for car in cars_cursor:
                car_id = str(car["_id"])
                car["id"] = car_id
                del car["_id"]
                from ..models import Car
                cars_by_id[car_id] = Car(**car)
            
            # Ajouter les annonces aux correspondances
            for match in matches:
                car_id = match["car_id"]
                if car_id in cars_by_id:
                    match["car"] = cars_by_id[car_id]
            
            # Convertir en objets AlertMatch
            from ..models import AlertMatch
            return [AlertMatch(**match) for match in matches]
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des correspondances de l'alerte {alert_id}: {str(e)}")
            return []
    
    async def mark_match_as_seen(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        match_id: str
    ) -> bool:
        """
        Marque une correspondance comme vue
        """
        try:
            # Récupérer la correspondance
            match = await db.alert_matches.find_one({"_id": ObjectId(match_id)})
            
            if not match:
                return False
            
            # Vérifier si l'alerte appartient à l'utilisateur
            alert = await db.alerts.find_one({
                "_id": match["alert_id"],
                "user_id": ObjectId(user_id)
            })
            
            if not alert:
                return False
            
            # Marquer comme vue
            await db.alert_matches.update_one(
                {"_id": ObjectId(match_id)},
                {"$set": {"seen": True}}
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Erreur lors du marquage de la correspondance {match_id} comme vue: {str(e)}")
            return False
    
    async def mark_all_matches_as_seen(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        alert_id: str
    ) -> bool:
        """
        Marque toutes les correspondances d'une alerte comme vues
        """
        try:
            # Vérifier si l'alerte existe et appartient à l'utilisateur
            alert = await db.alerts.find_one({
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            })
            
            if not alert:
                return False
            
            # Marquer toutes les correspondances comme vues
            await db.alert_matches.update_many(
                {"alert_id": ObjectId(alert_id), "seen": False},
                {"$set": {"seen": True}}
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Erreur lors du marquage de toutes les correspondances de l'alerte {alert_id} comme vues: {str(e)}")
            return False
    
    async def process_alerts(
        self,
        db: AsyncIOMotorDatabase,
        max_alerts: int = 100
    ) -> int:
        """
        Traite les alertes pour trouver de nouvelles correspondances
        """
        try:
            # Récupérer les alertes à traiter
            now = datetime.utcnow()
            min_interval = timedelta(minutes=settings.alert_check_interval_minutes)
            
            # Trouver les alertes qui n'ont pas été exécutées récemment
            query = {
                "$or": [
                    {"last_run": None},
                    {"last_run": {"$lt": now - min_interval}}
                ],
                "is_active": True
            }
            
            cursor = db.alerts.find(query).sort("last_run", 1).limit(max_alerts)
            
            alerts_processed = 0
            total_matches = 0
            
            async for alert in cursor:
                # Déterminer la date de dernière exécution
                last_run = alert.get("last_run")
                
                # Construire la requête pour trouver de nouvelles annonces
                search_query = self._build_search_query_from_alert(alert)
                
                # Ajouter un filtre sur la date de création si l'alerte a déjà été exécutée
                if last_run:
                    search_query["created_at"] = {"$gt": last_run}
                
                # Rechercher les nouvelles annonces
                cars_cursor = db.cars.find(search_query).limit(settings.max_alert_matches_per_run)
                
                # Traiter les correspondances
                matches_count = 0
                async for car in cars_cursor:
                    # Vérifier si cette correspondance existe déjà
                    existing_match = await db.alert_matches.find_one({
                        "alert_id": alert["_id"],
                        "car_id": car["_id"]
                    })
                    
                    if not existing_match:
                        # Créer une nouvelle correspondance
                        match_data = {
                            "alert_id": alert["_id"],
                            "car_id": car["_id"],
                            "created_at": now,
                            "seen": False
                        }
                        
                        await db.alert_matches.insert_one(match_data)
                        matches_count += 1
                
                # Mettre à jour l'alerte
                await db.alerts.update_one(
                    {"_id": alert["_id"]},
                    {
                        "$set": {
                            "last_run": now,
                            "last_match_count": matches_count
                        },
                        "$inc": {
                            "total_match_count": matches_count
                        }
                    }
                )
                
                # Envoyer des notifications si nécessaire
                if matches_count > 0:
                    await self._send_alert_notification(db, alert, matches_count)
                
                alerts_processed += 1
                total_matches += matches_count
            
            logger.info(f"Traitement des alertes terminé: {alerts_processed} alertes traitées, {total_matches} nouvelles correspondances trouvées")
            return alerts_processed
        
        except Exception as e:
            logger.error(f"Erreur lors du traitement des alertes: {str(e)}")
            return 0
    
    async def get_unread_matches_count(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str
    ) -> Dict[str, int]:
        """
        Récupère le nombre de correspondances non lues pour chaque alerte d'un utilisateur
        """
        try:
            # Récupérer les alertes de l'utilisateur
            alerts_cursor = db.alerts.find({"user_id": ObjectId(user_id)})
            
            result = {}
            
            async for alert in alerts_cursor:
                alert_id = str(alert["_id"])
                
                # Compter les correspondances non lues
                unread_count = await db.alert_matches.count_documents({
                    "alert_id": alert["_id"],
                    "seen": False
                })
                
                result[alert_id] = unread_count
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du nombre de correspondances non lues: {str(e)}")
            return {}
    
    def _build_search_query_from_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """
        Construit une requête MongoDB à partir d'une alerte
        """
        search_query = {}
        
        # Ajouter les filtres de base
        if alert.get("brand"):
            search_query["brand"] = {"$regex": f"^{re.escape(alert['brand'])}", "$options": "i"}
        
        if alert.get("model"):
            search_query["model"] = {"$regex": f"^{re.escape(alert['model'])}", "$options": "i"}
        
        if alert.get("price_min") is not None:
            search_query.setdefault("price", {})
            search_query["price"]["$gte"] = alert["price_min"]
        
        if alert.get("price_max") is not None:
            search_query.setdefault("price", {})
            search_query["price"]["$lte"] = alert["price_max"]
        
        if alert.get("year_min") is not None:
            search_query.setdefault("year", {})
            search_query["year"]["$gte"] = alert["year_min"]
        
        if alert.get("year_max") is not None:
            search_query.setdefault("year", {})
            search_query["year"]["$lte"] = alert["year_max"]
        
        if alert.get("mileage_min") is not None:
            search_query.setdefault("mileage", {})
            search_query["mileage"]["$gte"] = alert["mileage_min"]
        
        if alert.get("mileage_max") is not None:
            search_query.setdefault("mileage", {})
            search_query["mileage"]["$lte"] = alert["mileage_max"]
        
        if alert.get("fuel_type"):
            search_query["fuel_type"] = alert["fuel_type"]
        
        if alert.get("transmission"):
            search_query["transmission"] = alert["transmission"]
        
        if alert.get("location"):
            search_query["location"] = {"$regex": f".*{re.escape(alert['location'])}.*", "$options": "i"}
        
        if alert.get("source"):
            search_query["source"] = alert["source"]
        
        if alert.get("good_deals_only"):
            search_query["is_good_deal"] = True
        
        # Recherche par mots-clés
        if alert.get("keywords"):
            keywords = alert["keywords"].split()
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
    
    async def _document_to_alert_response(self, doc: Dict[str, Any]) -> AlertResponse:
        """
        Convertit un document MongoDB en objet AlertResponse
        """
        doc_copy = dict(doc)
        doc_copy["id"] = str(doc_copy.pop("_id"))
        doc_copy["user_id"] = str(doc_copy["user_id"])
        
        return AlertResponse(**doc_copy)
    
    async def _send_alert_notification(
        self,
        db: AsyncIOMotorDatabase,
        alert: Dict[str, Any],
        matches_count: int
    ) -> None:
        """
        Envoie une notification pour une alerte
        """
        try:
            # Récupérer l'utilisateur
            user = await db.users.find_one({"_id": alert["user_id"]})
            
            if not user:
                return
            
            # Vérifier les préférences de notification
            if not alert.get("notify_by_email", True):
                return
            
            # Préparer les données pour la notification
            notification_data = {
                "user_id": alert["user_id"],
                "alert_id": alert["_id"],
                "type": "alert_match",
                "title": f"Nouvelles annonces pour votre alerte '{alert.get('name', 'Sans nom')}'",
                "message": f"Nous avons trouvé {matches_count} nouvelle(s) annonce(s) correspondant à vos critères.",
                "created_at": datetime.utcnow(),
                "read": False,
                "data": {
                    "matches_count": matches_count,
                    "alert_name": alert.get("name", "Sans nom")
                }
            }
            
            # Enregistrer la notification
            await db.notifications.insert_one(notification_data)
            
            # Envoyer un email si nécessaire (à implémenter)
            # if alert.get("notify_by_email", True):
            #     await self._send_alert_email(user, alert, matches_count)
        
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de la notification d'alerte: {str(e)}") 