#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour la recherche d'annonces
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from fastapi.responses import JSONResponse

from ..models import (
    SearchRequest, SearchHistory, SavedSearch, SearchSuggestion,
    CarsListResponse
)
from ..dependencies import (
    get_current_user, get_current_active_user, get_db,
    get_search_service, pagination_params
)
from ..services.search_service import SearchService
from ..models.auth import User

# Configuration du logger
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Recherche non trouvée"}},
)

@router.post("/", response_model=CarsListResponse)
async def search_cars(
    search_request: SearchRequest,
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Recherche des annonces de voitures selon les critères spécifiés
    """
    try:
        result = await search_service.search_cars(
            db=db,
            search_request=search_request,
            user_id=current_user.id if current_user else None
        )
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la recherche d'annonces: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la recherche d'annonces"
        )

@router.get("/history", response_model=List[SearchHistory])
async def get_search_history(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère l'historique de recherche de l'utilisateur connecté
    """
    try:
        history = await search_service.get_search_history(
            db=db,
            user_id=current_user.id,
            page=page,
            page_size=page_size
        )
        return history
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique de recherche: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération de l'historique de recherche"
        )

@router.delete("/history/{search_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_search_history(
    search_id: str = Path(..., description="ID de la recherche"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Supprime une recherche de l'historique
    """
    try:
        result = await search_service.delete_search_history(
            db=db,
            search_id=search_id,
            user_id=current_user.id
        )
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recherche avec l'ID {search_id} non trouvée"
            )
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la recherche {search_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de la recherche {search_id}"
        )

@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_search_history(
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Efface tout l'historique de recherche de l'utilisateur
    """
    try:
        await search_service.clear_search_history(
            db=db,
            user_id=current_user.id
        )
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
    except Exception as e:
        logger.error(f"Erreur lors de l'effacement de l'historique de recherche: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'effacement de l'historique de recherche"
        )

@router.get("/saved", response_model=List[SavedSearch])
async def get_saved_searches(
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les recherches sauvegardées de l'utilisateur
    """
    try:
        saved_searches = await search_service.get_saved_searches(
            db=db,
            user_id=current_user.id
        )
        return saved_searches
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des recherches sauvegardées: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des recherches sauvegardées"
        )

@router.post("/saved", response_model=SavedSearch, status_code=status.HTTP_201_CREATED)
async def save_search(
    search_id: str = Query(..., description="ID de la recherche à sauvegarder"),
    name: str = Query(..., description="Nom de la recherche sauvegardée"),
    notification_enabled: bool = Query(False, description="Activer les notifications"),
    notification_frequency: str = Query("daily", description="Fréquence des notifications"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Sauvegarde une recherche
    """
    try:
        saved_search = await search_service.save_search(
            db=db,
            search_id=search_id,
            user_id=current_user.id,
            name=name,
            notification_enabled=notification_enabled,
            notification_frequency=notification_frequency
        )
        if saved_search is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recherche avec l'ID {search_id} non trouvée"
            )
        return saved_search
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde de la recherche {search_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la sauvegarde de la recherche {search_id}"
        )

@router.put("/saved/{saved_search_id}", response_model=SavedSearch)
async def update_saved_search(
    saved_search_id: str = Path(..., description="ID de la recherche sauvegardée"),
    name: Optional[str] = Query(None, description="Nouveau nom de la recherche"),
    notification_enabled: Optional[bool] = Query(None, description="Activer/désactiver les notifications"),
    notification_frequency: Optional[str] = Query(None, description="Nouvelle fréquence des notifications"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Met à jour une recherche sauvegardée
    """
    try:
        # Création des données de mise à jour
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if notification_enabled is not None:
            update_data["notification_enabled"] = notification_enabled
        if notification_frequency is not None:
            update_data["notification_frequency"] = notification_frequency
        
        updated_search = await search_service.update_saved_search(
            db=db,
            saved_search_id=saved_search_id,
            user_id=current_user.id,
            update_data=update_data
        )
        
        if updated_search is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recherche sauvegardée avec l'ID {saved_search_id} non trouvée"
            )
        
        return updated_search
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de la recherche sauvegardée {saved_search_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour de la recherche sauvegardée {saved_search_id}"
        )

@router.delete("/saved/{saved_search_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_search(
    saved_search_id: str = Path(..., description="ID de la recherche sauvegardée"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Supprime une recherche sauvegardée
    """
    try:
        result = await search_service.delete_saved_search(
            db=db,
            saved_search_id=saved_search_id,
            user_id=current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recherche sauvegardée avec l'ID {saved_search_id} non trouvée"
            )
        
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content={})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la recherche sauvegardée {saved_search_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de la recherche sauvegardée {saved_search_id}"
        )

@router.get("/suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    query: str = Query(..., description="Terme de recherche"),
    type: Optional[str] = Query(None, description="Type de suggestion (brand, model, location, keyword)"),
    limit: int = Query(10, ge=1, le=50, description="Nombre maximum de suggestions"),
    db = Depends(get_db),
    search_service: SearchService = Depends(get_search_service)
):
    """
    Récupère des suggestions de recherche basées sur un terme
    """
    try:
        suggestions = await search_service.get_search_suggestions(
            db=db,
            query=query,
            type=type,
            limit=limit
        )
        return suggestions
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des suggestions de recherche: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des suggestions de recherche"
        ) 