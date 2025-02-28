#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour les fonctionnalités d'administration
"""

import logging
from typing import Dict, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..dependencies import get_db, get_admin_user
from ..models import (
    AdminStats, UserListResponse, User, UserCreate,
    SystemLogResponse, ScraperJobCreate, ScraperJobResponse, ScraperJobsListResponse
)
from ..services.admin_service import AdminService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={403: {"description": "Accès interdit"}}
)

admin_service = AdminService()

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Récupère les statistiques d'administration
    """
    try:
        return await admin_service.get_admin_stats(db)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques d'administration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des statistiques d'administration"
        )

@router.get("/users", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    sort_by: str = Query("created_at_desc", description="Critère de tri"),
    search: Optional[str] = Query(None, description="Recherche par email ou nom"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Récupère la liste des utilisateurs
    """
    try:
        return await admin_service.get_users(db, page, page_size, sort_by, search)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des utilisateurs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des utilisateurs"
        )

@router.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Crée un nouvel utilisateur
    """
    try:
        user = await admin_service.create_user(db, user_data)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création de l'utilisateur"
        )

@router.put("/users/{user_id}/status", status_code=status.HTTP_204_NO_CONTENT)
async def update_user_status(
    user_id: str = Path(..., description="ID de l'utilisateur"),
    is_active: bool = Body(..., embed=True),
    is_admin: Optional[bool] = Body(None, embed=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Met à jour le statut d'un utilisateur
    """
    try:
        # Empêcher un administrateur de se désactiver lui-même
        if user_id == str(current_user["id"]) and not is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas vous désactiver vous-même"
            )
        
        result = await admin_service.update_user_status(db, user_id, is_active, is_admin)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du statut de l'utilisateur {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour du statut de l'utilisateur"
        )

@router.get("/logs", response_model=SystemLogResponse)
async def get_system_logs(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(100, ge=1, le=1000, description="Nombre d'éléments par page"),
    level: Optional[str] = Query(None, description="Niveau de log (INFO, WARNING, ERROR, CRITICAL)"),
    start_date: Optional[datetime] = Query(None, description="Date de début"),
    end_date: Optional[datetime] = Query(None, description="Date de fin"),
    source: Optional[str] = Query(None, description="Source du log"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Récupère les logs système
    """
    try:
        return await admin_service.get_system_logs(db, page, page_size, level, start_date, end_date, source)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des logs système: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des logs système"
        )

@router.post("/scraper-jobs", response_model=ScraperJobResponse, status_code=status.HTTP_201_CREATED)
async def create_scraper_job(
    job_data: ScraperJobCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Crée une nouvelle tâche de scraping
    """
    try:
        job = await admin_service.create_scraper_job(db, job_data)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de créer la tâche de scraping"
            )
        
        return job
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création de la tâche de scraping: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création de la tâche de scraping"
        )

@router.get("/scraper-jobs", response_model=ScraperJobsListResponse)
async def get_scraper_jobs(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    status: Optional[str] = Query(None, description="Statut de la tâche"),
    source: Optional[str] = Query(None, description="Source de la tâche"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Récupère la liste des tâches de scraping
    """
    try:
        return await admin_service.get_scraper_jobs(db, page, page_size, status, source)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des tâches de scraping: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des tâches de scraping"
        )

@router.get("/scraper-jobs/{job_id}", response_model=ScraperJobResponse)
async def get_scraper_job(
    job_id: str = Path(..., description="ID de la tâche"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Récupère une tâche de scraping spécifique
    """
    try:
        job = await admin_service.get_scraper_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tâche de scraping non trouvée"
            )
        
        return job
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la tâche de scraping {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération de la tâche de scraping"
        )

@router.put("/scraper-jobs/{job_id}/status", status_code=status.HTTP_204_NO_CONTENT)
async def update_scraper_job_status(
    job_id: str = Path(..., description="ID de la tâche"),
    status: str = Body(..., embed=True),
    error: Optional[str] = Body(None, embed=True),
    results: Optional[Dict] = Body(None, embed=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Met à jour le statut d'une tâche de scraping
    """
    try:
        if status not in ["pending", "running", "completed", "failed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Statut invalide"
            )
        
        result = await admin_service.update_scraper_job_status(db, job_id, status, error, results)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tâche de scraping non trouvée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du statut de la tâche de scraping {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour du statut de la tâche de scraping"
        )

@router.delete("/scraper-jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scraper_job(
    job_id: str = Path(..., description="ID de la tâche"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Supprime une tâche de scraping
    """
    try:
        result = await admin_service.delete_scraper_job(db, job_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tâche de scraping non trouvée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la tâche de scraping {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la suppression de la tâche de scraping"
        )

@router.post("/clean-data", response_model=Dict[str, int])
async def clean_old_data(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Nettoie les anciennes données
    """
    try:
        return await admin_service.clean_old_data(db)
    
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage des anciennes données: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors du nettoyage des anciennes données"
        ) 