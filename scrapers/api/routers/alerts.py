#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour la gestion des alertes
"""

import logging
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..dependencies import get_db, get_current_user
from ..models import (
    AlertCreate, AlertUpdate, AlertResponse, AlertMatch, AlertsListResponse
)
from ..services.alerts_service import AlertsService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
    responses={404: {"description": "Alerte non trouvée"}}
)

alerts_service = AlertsService()

@router.get("/", response_model=AlertsListResponse)
async def get_alerts(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère les alertes de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        return await alerts_service.get_alerts(db, user_id, page, page_size)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des alertes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des alertes"
        )

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crée une nouvelle alerte pour l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        alert = await alerts_service.create_alert(db, user_id, alert_data)
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de créer l'alerte. Vous avez peut-être atteint le nombre maximum d'alertes."
            )
        
        return alert
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'alerte: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création de l'alerte"
        )

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str = Path(..., description="ID de l'alerte"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère une alerte spécifique de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        alert = await alerts_service.get_alert(db, user_id, alert_id)
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerte non trouvée"
            )
        
        return alert
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'alerte {alert_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération de l'alerte"
        )

@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_data: AlertUpdate,
    alert_id: str = Path(..., description="ID de l'alerte"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Met à jour une alerte de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        alert = await alerts_service.update_alert(db, user_id, alert_id, alert_data)
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerte non trouvée"
            )
        
        return alert
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'alerte {alert_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour de l'alerte"
        )

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str = Path(..., description="ID de l'alerte"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Supprime une alerte de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        result = await alerts_service.delete_alert(db, user_id, alert_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerte non trouvée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'alerte {alert_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la suppression de l'alerte"
        )

@router.get("/{alert_id}/matches", response_model=List[AlertMatch])
async def get_alert_matches(
    alert_id: str = Path(..., description="ID de l'alerte"),
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    include_seen: bool = Query(False, description="Inclure les correspondances déjà vues"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère les correspondances d'une alerte de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        return await alerts_service.get_alert_matches(db, user_id, alert_id, page, page_size, include_seen)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des correspondances de l'alerte {alert_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des correspondances de l'alerte"
        )

@router.post("/{alert_id}/matches/{match_id}/seen", status_code=status.HTTP_204_NO_CONTENT)
async def mark_match_as_seen(
    alert_id: str = Path(..., description="ID de l'alerte"),
    match_id: str = Path(..., description="ID de la correspondance"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Marque une correspondance comme vue
    """
    try:
        user_id = str(current_user["id"])
        result = await alerts_service.mark_match_as_seen(db, user_id, match_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Correspondance non trouvée ou non autorisée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du marquage de la correspondance {match_id} comme vue: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors du marquage de la correspondance comme vue"
        )

@router.post("/{alert_id}/matches/seen-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_matches_as_seen(
    alert_id: str = Path(..., description="ID de l'alerte"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Marque toutes les correspondances d'une alerte comme vues
    """
    try:
        user_id = str(current_user["id"])
        result = await alerts_service.mark_all_matches_as_seen(db, user_id, alert_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerte non trouvée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du marquage de toutes les correspondances de l'alerte {alert_id} comme vues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors du marquage de toutes les correspondances comme vues"
        )

@router.get("/unread-count", response_model=Dict[str, int])
async def get_unread_matches_count(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère le nombre de correspondances non lues pour chaque alerte de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        return await alerts_service.get_unread_matches_count(db, user_id)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du nombre de correspondances non lues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération du nombre de correspondances non lues"
        ) 