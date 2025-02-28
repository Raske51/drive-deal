#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour la gestion des favoris
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..dependencies import get_db, get_current_user
from ..models import (
    FavoriteCreate, FavoriteResponse, CarsListResponse
)
from ..services.favorites_service import FavoritesService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/favorites",
    tags=["favorites"],
    responses={404: {"description": "Favori non trouvé"}}
)

favorites_service = FavoritesService()

@router.get("/", response_model=CarsListResponse)
async def get_favorites(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère les annonces favorites de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        return await favorites_service.get_favorites(db, user_id, page, page_size)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des favoris: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des favoris"
        )

@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Ajoute une annonce aux favoris de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        favorite = await favorites_service.add_favorite(db, user_id, favorite_data)
        
        if not favorite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Annonce non trouvée"
            )
        
        return favorite
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout d'un favori: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de l'ajout d'un favori"
        )

@router.get("/{favorite_id}", response_model=FavoriteResponse)
async def get_favorite(
    favorite_id: str = Path(..., description="ID du favori"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupère un favori spécifique de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        favorite = await favorites_service.get_favorite(db, user_id, favorite_id)
        
        if not favorite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favori non trouvé"
            )
        
        return favorite
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du favori {favorite_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération du favori"
        )

@router.put("/{favorite_id}", response_model=FavoriteResponse)
async def update_favorite(
    favorite_data: FavoriteCreate,
    favorite_id: str = Path(..., description="ID du favori"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Met à jour un favori de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        favorite = await favorites_service.update_favorite(db, user_id, favorite_id, favorite_data)
        
        if not favorite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favori non trouvé"
            )
        
        return favorite
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du favori {favorite_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour du favori"
        )

@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite(
    favorite_id: str = Path(..., description="ID du favori"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Supprime un favori de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        result = await favorites_service.delete_favorite(db, user_id, favorite_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favori non trouvé"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du favori {favorite_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la suppression du favori"
        )

@router.get("/check/{car_id}", response_model=bool)
async def is_favorite(
    car_id: str = Path(..., description="ID de l'annonce"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Vérifie si une annonce est dans les favoris de l'utilisateur connecté
    """
    try:
        user_id = str(current_user["id"])
        return await favorites_service.is_favorite(db, user_id, car_id)
    
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du favori: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la vérification du favori"
        ) 