#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour les fonctionnalités d'administration
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from ..models import (
    AdminStats, UserListResponse, User, UserCreate,
    SystemLog, SystemLogResponse, ScraperJob,
    ScraperJobCreate, ScraperJobResponse, ScraperJobsListResponse
)
from ..config import settings

logger = logging.getLogger(__name__)

class AdminService:
    """
    Service pour les fonctionnalités d'administration
    """
    
    async def get_admin_stats(
        self,
        db: AsyncIOMotorDatabase
    ) -> AdminStats:
        """
        Récupère les statistiques d'administration
        """
        try:
            # Compter le nombre total d'annonces
            total_cars = await db.cars.count_documents({})
            
            # Compter le nombre d'annonces par source
            sources_cursor = db.cars.aggregate([
                {"$group": {"_id": "$source", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ])
            
            cars_by_source = {}
            async for doc in sources_cursor:
                if doc["_id"]:
                    cars_by_source[doc["_id"]] = doc["count"]
            
            # Compter le nombre d'utilisateurs
            total_users = await db.users.count_documents({})
            active_users = await db.users.count_documents({"is_active": True})
            
            # Compter le nombre d'utilisateurs créés au cours des 30 derniers jours
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            new_users_30d = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})
            
            # Compter le nombre d'utilisateurs connectés au cours des 7 derniers jours
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            active_users_7d = await db.users.count_documents({"last_login": {"$gte": seven_days_ago}})
            
            # Compter le nombre de favoris et d'alertes
            total_favorites = await db.favorites.count_documents({})
            total_alerts = await db.alerts.count_documents({})
            
            # Récupérer les statistiques des tâches de scraping
            scraper_jobs_cursor = db.scraper_jobs.aggregate([
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }}
            ])
            
            scraper_jobs_by_status = {}
            async for doc in scraper_jobs_cursor:
                scraper_jobs_by_status[doc["_id"]] = doc["count"]
            
            # Récupérer les statistiques des erreurs système
            errors_24h = await db.system_logs.count_documents({
                "level": "ERROR",
                "timestamp": {"$gte": datetime.utcnow() - timedelta(days=1)}
            })
            
            # Récupérer les statistiques de stockage
            storage_stats = await self._get_storage_stats(db)
            
            return AdminStats(
                total_cars=total_cars,
                cars_by_source=cars_by_source,
                total_users=total_users,
                active_users=active_users,
                new_users_30d=new_users_30d,
                active_users_7d=active_users_7d,
                total_favorites=total_favorites,
                total_alerts=total_alerts,
                scraper_jobs=scraper_jobs_by_status,
                errors_24h=errors_24h,
                storage_stats=storage_stats
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des statistiques d'administration: {str(e)}")
            return AdminStats(
                total_cars=0,
                cars_by_source={},
                total_users=0,
                active_users=0,
                new_users_30d=0,
                active_users_7d=0,
                total_favorites=0,
                total_alerts=0,
                scraper_jobs={},
                errors_24h=0,
                storage_stats={}
            )
    
    async def get_users(
        self,
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at_desc",
        search: Optional[str] = None
    ) -> UserListResponse:
        """
        Récupère la liste des utilisateurs
        """
        try:
            skip = (page - 1) * page_size
            
            # Construire la requête
            query = {}
            if search:
                query["$or"] = [
                    {"email": {"$regex": f".*{search}.*", "$options": "i"}},
                    {"full_name": {"$regex": f".*{search}.*", "$options": "i"}}
                ]
            
            # Déterminer le tri
            sort_parts = sort_by.split("_")
            sort_field = "_".join(sort_parts[:-1]) if len(sort_parts) > 1 else sort_parts[0]
            sort_direction = 1 if sort_by.endswith("_asc") else -1
            
            # Exécuter la requête
            total = await db.users.count_documents(query)
            cursor = db.users.find(query).sort(sort_field, sort_direction).skip(skip).limit(page_size)
            
            # Convertir les résultats en objets User
            users = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                # Supprimer le mot de passe haché
                doc.pop("hashed_password", None)
                users.append(User(**doc))
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            return UserListResponse(
                items=users,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des utilisateurs: {str(e)}")
            return UserListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def create_user(
        self,
        db: AsyncIOMotorDatabase,
        user_data: UserCreate
    ) -> Optional[User]:
        """
        Crée un nouvel utilisateur (par un administrateur)
        """
        try:
            # Vérifier si l'email existe déjà
            existing_user = await db.users.find_one({"email": user_data.email})
            if existing_user:
                logger.warning(f"Tentative de création d'un utilisateur avec un email déjà utilisé: {user_data.email}")
                return None
            
            # Hacher le mot de passe
            from ..services.auth_service import AuthService
            auth_service = AuthService()
            hashed_password = auth_service._hash_password(user_data.password)
            
            # Préparer les données utilisateur
            user_dict = {
                "email": user_data.email,
                "hashed_password": hashed_password,
                "full_name": user_data.full_name,
                "is_active": True,
                "is_admin": user_data.is_admin,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_login": None,
                "email_verified": True  # Les utilisateurs créés par un admin sont considérés comme vérifiés
            }
            
            # Insérer l'utilisateur dans la base de données
            result = await db.users.insert_one(user_dict)
            
            # Récupérer l'utilisateur créé
            created_user = await db.users.find_one({"_id": result.inserted_id})
            
            # Convertir en objet User
            created_user["id"] = str(created_user.pop("_id"))
            created_user.pop("hashed_password", None)
            
            return User(**created_user)
        
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'utilisateur: {str(e)}")
            return None
    
    async def update_user_status(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        is_active: bool,
        is_admin: Optional[bool] = None
    ) -> bool:
        """
        Met à jour le statut d'un utilisateur
        """
        try:
            # Préparer les données à mettre à jour
            update_data = {
                "is_active": is_active,
                "updated_at": datetime.utcnow()
            }
            
            if is_admin is not None:
                update_data["is_admin"] = is_admin
            
            # Mettre à jour l'utilisateur
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du statut de l'utilisateur {user_id}: {str(e)}")
            return False
    
    async def get_system_logs(
        self,
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 100,
        level: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        source: Optional[str] = None
    ) -> SystemLogResponse:
        """
        Récupère les logs système
        """
        try:
            skip = (page - 1) * page_size
            
            # Construire la requête
            query = {}
            
            if level:
                query["level"] = level
            
            if start_date or end_date:
                query["timestamp"] = {}
                if start_date:
                    query["timestamp"]["$gte"] = start_date
                if end_date:
                    query["timestamp"]["$lte"] = end_date
            
            if source:
                query["source"] = source
            
            # Exécuter la requête
            total = await db.system_logs.count_documents(query)
            cursor = db.system_logs.find(query).sort("timestamp", -1).skip(skip).limit(page_size)
            
            # Convertir les résultats en objets SystemLog
            logs = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                logs.append(SystemLog(**doc))
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            return SystemLogResponse(
                items=logs,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des logs système: {str(e)}")
            return SystemLogResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def create_scraper_job(
        self,
        db: AsyncIOMotorDatabase,
        job_data: ScraperJobCreate
    ) -> Optional[ScraperJobResponse]:
        """
        Crée une nouvelle tâche de scraping
        """
        try:
            # Préparer les données de la tâche
            job_dict = job_data.model_dump(exclude_unset=True)
            job_dict["created_at"] = datetime.utcnow()
            job_dict["updated_at"] = job_dict["created_at"]
            job_dict["status"] = "pending"
            job_dict["start_time"] = None
            job_dict["end_time"] = None
            job_dict["error"] = None
            job_dict["results"] = {}
            
            # Insérer la tâche dans la base de données
            result = await db.scraper_jobs.insert_one(job_dict)
            
            # Récupérer la tâche créée
            created_job = await db.scraper_jobs.find_one({"_id": result.inserted_id})
            
            # Convertir en objet ScraperJobResponse
            created_job["id"] = str(created_job.pop("_id"))
            
            return ScraperJobResponse(**created_job)
        
        except Exception as e:
            logger.error(f"Erreur lors de la création de la tâche de scraping: {str(e)}")
            return None
    
    async def get_scraper_jobs(
        self,
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        source: Optional[str] = None
    ) -> ScraperJobsListResponse:
        """
        Récupère la liste des tâches de scraping
        """
        try:
            skip = (page - 1) * page_size
            
            # Construire la requête
            query = {}
            
            if status:
                query["status"] = status
            
            if source:
                query["source"] = source
            
            # Exécuter la requête
            total = await db.scraper_jobs.count_documents(query)
            cursor = db.scraper_jobs.find(query).sort("created_at", -1).skip(skip).limit(page_size)
            
            # Convertir les résultats en objets ScraperJob
            jobs = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                jobs.append(ScraperJobResponse(**doc))
            
            # Calculer le nombre total de pages
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            
            return ScraperJobsListResponse(
                items=jobs,
                total=total,
                page=page,
                page_size=page_size,
                pages=total_pages
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des tâches de scraping: {str(e)}")
            return ScraperJobsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                pages=0
            )
    
    async def get_scraper_job(
        self,
        db: AsyncIOMotorDatabase,
        job_id: str
    ) -> Optional[ScraperJobResponse]:
        """
        Récupère une tâche de scraping spécifique
        """
        try:
            job = await db.scraper_jobs.find_one({"_id": ObjectId(job_id)})
            
            if not job:
                return None
            
            job["id"] = str(job.pop("_id"))
            return ScraperJobResponse(**job)
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la tâche de scraping {job_id}: {str(e)}")
            return None
    
    async def update_scraper_job_status(
        self,
        db: AsyncIOMotorDatabase,
        job_id: str,
        status: str,
        error: Optional[str] = None,
        results: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Met à jour le statut d'une tâche de scraping
        """
        try:
            # Préparer les données à mettre à jour
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            
            # Mettre à jour les champs en fonction du statut
            if status == "running":
                update_data["start_time"] = datetime.utcnow()
            
            if status in ["completed", "failed"]:
                update_data["end_time"] = datetime.utcnow()
            
            if error:
                update_data["error"] = error
            
            if results:
                update_data["results"] = results
            
            # Mettre à jour la tâche
            result = await db.scraper_jobs.update_one(
                {"_id": ObjectId(job_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du statut de la tâche de scraping {job_id}: {str(e)}")
            return False
    
    async def delete_scraper_job(
        self,
        db: AsyncIOMotorDatabase,
        job_id: str
    ) -> bool:
        """
        Supprime une tâche de scraping
        """
        try:
            result = await db.scraper_jobs.delete_one({"_id": ObjectId(job_id)})
            return result.deleted_count > 0
        
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la tâche de scraping {job_id}: {str(e)}")
            return False
    
    async def clean_old_data(
        self,
        db: AsyncIOMotorDatabase
    ) -> Dict[str, int]:
        """
        Nettoie les anciennes données
        """
        try:
            results = {}
            
            # Supprimer les anciennes annonces
            if settings.car_listings_retention_days > 0:
                retention_date = datetime.utcnow() - timedelta(days=settings.car_listings_retention_days)
                old_cars_result = await db.cars.delete_many({
                    "created_at": {"$lt": retention_date},
                    "is_good_deal": False  # Conserver les bonnes affaires
                })
                results["old_cars_deleted"] = old_cars_result.deleted_count
            
            # Supprimer les anciens logs système
            if settings.system_logs_retention_days > 0:
                retention_date = datetime.utcnow() - timedelta(days=settings.system_logs_retention_days)
                old_logs_result = await db.system_logs.delete_many({
                    "timestamp": {"$lt": retention_date},
                    "level": {"$ne": "ERROR"}  # Conserver les erreurs
                })
                results["old_logs_deleted"] = old_logs_result.deleted_count
            
            # Supprimer les anciennes tâches de scraping
            if settings.scraper_jobs_retention_days > 0:
                retention_date = datetime.utcnow() - timedelta(days=settings.scraper_jobs_retention_days)
                old_jobs_result = await db.scraper_jobs.delete_many({
                    "created_at": {"$lt": retention_date},
                    "status": {"$in": ["completed", "failed"]}  # Ne supprimer que les tâches terminées ou échouées
                })
                results["old_jobs_deleted"] = old_jobs_result.deleted_count
            
            # Supprimer les anciens tokens de rafraîchissement
            old_tokens_result = await db.refresh_tokens.delete_many({
                "expires_at": {"$lt": datetime.utcnow()}
            })
            results["expired_tokens_deleted"] = old_tokens_result.deleted_count
            
            # Supprimer les anciennes correspondances d'alerte vues
            if settings.alert_matches_retention_days > 0:
                retention_date = datetime.utcnow() - timedelta(days=settings.alert_matches_retention_days)
                old_matches_result = await db.alert_matches.delete_many({
                    "created_at": {"$lt": retention_date},
                    "seen": True
                })
                results["old_alert_matches_deleted"] = old_matches_result.deleted_count
            
            logger.info(f"Nettoyage des anciennes données terminé: {results}")
            return results
        
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage des anciennes données: {str(e)}")
            return {"error": str(e)}
    
    async def _get_storage_stats(self, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """
        Récupère les statistiques de stockage
        """
        try:
            stats = {}
            
            # Récupérer la taille de chaque collection
            collections = [
                "cars", "users", "favorites", "alerts", "alert_matches",
                "refresh_tokens", "system_logs", "scraper_jobs", "notifications"
            ]
            
            for collection in collections:
                collection_stats = await db.command("collStats", collection)
                stats[collection] = {
                    "count": collection_stats.get("count", 0),
                    "size_mb": round(collection_stats.get("size", 0) / (1024 * 1024), 2),
                    "avg_obj_size_kb": round(collection_stats.get("avgObjSize", 0) / 1024, 2) if collection_stats.get("count", 0) > 0 else 0
                }
            
            # Récupérer les statistiques globales
            db_stats = await db.command("dbStats")
            stats["total"] = {
                "size_mb": round(db_stats.get("dataSize", 0) / (1024 * 1024), 2),
                "storage_mb": round(db_stats.get("storageSize", 0) / (1024 * 1024), 2),
                "index_size_mb": round(db_stats.get("indexSize", 0) / (1024 * 1024), 2)
            }
            
            return stats
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des statistiques de stockage: {str(e)}")
            return {} 