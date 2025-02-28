#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour la gestion des annonces de voitures
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..dependencies import get_db, get_current_user, get_current_user_optional
from ..models import (
    Car, CarCreate, CarUpdate, CarResponse, CarsListResponse
)
from ..services.car_service import CarService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/cars",
    tags=["cars"],
    responses={404: {"description": "Annonce non trouvée"}}
)

car_service = CarService()

@router.get("/", response_model=CarsListResponse)
async def get_cars(
    db: AsyncIOMotorDatabase = Depends(get_db),
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    sort_by: str = Query("created_at_desc", description="Critère de tri"),
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    price_min: Optional[float] = Query(None, ge=0, description="Prix minimum"),
    price_max: Optional[float] = Query(None, ge=0, description="Prix maximum"),
    year_min: Optional[int] = Query(None, ge=1900, description="Année minimum"),
    year_max: Optional[int] = Query(None, ge=1900, description="Année maximum"),
    mileage_min: Optional[int] = Query(None, ge=0, description="Kilométrage minimum"),
    mileage_max: Optional[int] = Query(None, ge=0, description="Kilométrage maximum"),
    fuel_type: Optional[str] = Query(None, description="Type de carburant"),
    transmission: Optional[str] = Query(None, description="Type de transmission"),
    location: Optional[str] = Query(None, description="Localisation"),
    source: Optional[str] = Query(None, description="Source"),
    good_deals_only: bool = Query(False, description="Uniquement les bonnes affaires"),
    keywords: Optional[str] = Query(None, description="Mots-clés"),
    current_user = Depends(get_current_user_optional)
):
    """
    Récupère une liste d'annonces de voitures avec pagination et filtres
    """
    try:
        # Construire les filtres
        filters = {}
        if brand:
            filters["brand"] = brand
        if model:
            filters["model"] = model
        if price_min is not None:
            filters["price_min"] = price_min
        if price_max is not None:
            filters["price_max"] = price_max
        if year_min is not None:
            filters["year_min"] = year_min
        if year_max is not None:
            filters["year_max"] = year_max
        if mileage_min is not None:
            filters["mileage_min"] = mileage_min
        if mileage_max is not None:
            filters["mileage_max"] = mileage_max
        if fuel_type:
            filters["fuel_type"] = fuel_type
        if transmission:
            filters["transmission"] = transmission
        if location:
            filters["location"] = location
        if source:
            filters["source"] = source
        if good_deals_only:
            filters["good_deals_only"] = good_deals_only
        if keywords:
            filters["keywords"] = keywords
        
        # Récupérer les annonces
        user_id = str(current_user["id"]) if current_user else None
        return await car_service.get_cars(db, page, page_size, sort_by, filters, user_id)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des annonces: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des annonces"
        )

@router.get("/{car_id}", response_model=CarResponse)
async def get_car(
    car_id: str = Path(..., description="ID de l'annonce"),
    include_similar: bool = Query(True, description="Inclure les annonces similaires"),
    include_price_analysis: bool = Query(True, description="Inclure l'analyse de prix"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Récupère une annonce de voiture par son ID
    """
    try:
        user_id = str(current_user["id"]) if current_user else None
        car = await car_service.get_car_by_id(db, car_id, include_similar, include_price_analysis, user_id)
        
        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Annonce non trouvée"
            )
        
        return car
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'annonce {car_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération de l'annonce"
        )

@router.post("/", response_model=Car, status_code=status.HTTP_201_CREATED)
async def create_car(
    car_data: CarCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crée une nouvelle annonce de voiture (réservé aux administrateurs)
    """
    try:
        # Vérifier si l'utilisateur est administrateur
        if not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les administrateurs peuvent créer des annonces"
            )
        
        car = await car_service.create_car(db, car_data)
        
        if not car:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de créer l'annonce"
            )
        
        return car
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'annonce: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création de l'annonce"
        )

@router.put("/{car_id}", response_model=Car)
async def update_car(
    car_data: CarUpdate,
    car_id: str = Path(..., description="ID de l'annonce"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Met à jour une annonce de voiture (réservé aux administrateurs)
    """
    try:
        # Vérifier si l'utilisateur est administrateur
        if not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les administrateurs peuvent mettre à jour des annonces"
            )
        
        car = await car_service.update_car(db, car_id, car_data)
        
        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Annonce non trouvée"
            )
        
        return car
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'annonce {car_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour de l'annonce"
        )

@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
    car_id: str = Path(..., description="ID de l'annonce"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Supprime une annonce de voiture (réservé aux administrateurs)
    """
    try:
        # Vérifier si l'utilisateur est administrateur
        if not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les administrateurs peuvent supprimer des annonces"
            )
        
        result = await car_service.delete_car(db, car_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Annonce non trouvée"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'annonce {car_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la suppression de l'annonce"
        )

@router.get("/brands/", response_model=List[str])
async def get_brands(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère la liste des marques disponibles
    """
    try:
        return await car_service.get_brands(db)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des marques: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des marques"
        )

@router.get("/models/", response_model=List[str])
async def get_models(
    brand: Optional[str] = Query(None, description="Marque"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère la liste des modèles disponibles, éventuellement filtrés par marque
    """
    try:
        return await car_service.get_models(db, brand)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des modèles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des modèles"
        ) 