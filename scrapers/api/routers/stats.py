#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour les statistiques et analyses de marché
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..dependencies import get_db
from ..models import (
    MarketOverview, PriceDistribution, PriceTrend,
    PopularBrand, PopularModel, PriceByAge,
    PriceByMileage, MarketInsight
)
from ..services.stats_service import StatsService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
    responses={404: {"description": "Statistiques non trouvées"}}
)

stats_service = StatsService()

@router.get("/market-overview", response_model=MarketOverview)
async def get_market_overview(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère une vue d'ensemble du marché
    """
    try:
        return await stats_service.get_market_overview(db, brand, model)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la vue d'ensemble du marché: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération de la vue d'ensemble du marché"
        )

@router.get("/price-distribution", response_model=PriceDistribution)
async def get_price_distribution(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    bins: int = Query(10, ge=5, le=50, description="Nombre d'intervalles"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère la distribution des prix
    """
    try:
        return await stats_service.get_price_distribution(db, brand, model, bins)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la distribution des prix: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération de la distribution des prix"
        )

@router.get("/price-trends", response_model=PriceTrend)
async def get_price_trends(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    period_days: int = Query(90, ge=7, le=365, description="Période en jours"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère les tendances de prix sur une période
    """
    try:
        return await stats_service.get_price_trends(db, brand, model, period_days)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des tendances de prix: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des tendances de prix"
        )

@router.get("/popular-brands", response_model=List[PopularBrand])
async def get_popular_brands(
    limit: int = Query(10, ge=1, le=50, description="Nombre maximum de marques"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère les marques les plus populaires
    """
    try:
        return await stats_service.get_popular_brands(db, limit)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des marques populaires: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des marques populaires"
        )

@router.get("/popular-models", response_model=List[PopularModel])
async def get_popular_models(
    brand: Optional[str] = Query(None, description="Marque"),
    limit: int = Query(10, ge=1, le=50, description="Nombre maximum de modèles"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère les modèles les plus populaires
    """
    try:
        return await stats_service.get_popular_models(db, brand, limit)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des modèles populaires: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des modèles populaires"
        )

@router.get("/price-by-age", response_model=PriceByAge)
async def get_price_by_age(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère les prix moyens par âge du véhicule
    """
    try:
        return await stats_service.get_price_by_age(db, brand, model)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des prix par âge: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des prix par âge"
        )

@router.get("/price-by-mileage", response_model=PriceByMileage)
async def get_price_by_mileage(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    bins: int = Query(10, ge=5, le=50, description="Nombre d'intervalles"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère les prix moyens par kilométrage
    """
    try:
        return await stats_service.get_price_by_mileage(db, brand, model, bins)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des prix par kilométrage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des prix par kilométrage"
        )

@router.get("/market-insights", response_model=List[MarketInsight])
async def get_market_insights(
    brand: Optional[str] = Query(None, description="Marque"),
    model: Optional[str] = Query(None, description="Modèle"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Récupère des insights sur le marché
    """
    try:
        return await stats_service.get_market_insights(db, brand, model)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des insights du marché: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la récupération des insights du marché"
        )

 