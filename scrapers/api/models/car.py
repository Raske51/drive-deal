#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les voitures et les annonces
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class Car(BaseModel):
    """
    Modèle de données pour une voiture
    """
    id: str
    title: str
    brand: str
    model: str
    year: int
    price: float
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    power: Optional[int] = None
    engine_size: Optional[float] = None
    doors: Optional[int] = None
    color: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[HttpUrl]] = None
    url: Optional[HttpUrl] = None
    source: str
    source_id: Optional[str] = None
    is_good_deal: bool = False
    created_at: datetime
    updated_at: datetime
    
    # Champs supplémentaires pour les favoris
    favorite_id: Optional[str] = None
    favorite_note: Optional[int] = None
    favorite_comments: Optional[str] = None
    favorite_created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CarCreate(BaseModel):
    """
    Modèle de données pour la création d'une voiture
    """
    title: str
    brand: str
    model: str
    year: int
    price: float
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    power: Optional[int] = None
    engine_size: Optional[float] = None
    doors: Optional[int] = None
    color: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[HttpUrl]] = None
    url: Optional[HttpUrl] = None
    source: str
    source_id: Optional[str] = None


class CarUpdate(BaseModel):
    """
    Modèle de données pour la mise à jour d'une voiture
    """
    title: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    power: Optional[int] = None
    engine_size: Optional[float] = None
    doors: Optional[int] = None
    color: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[HttpUrl]] = None
    url: Optional[HttpUrl] = None
    source_id: Optional[str] = None
    is_good_deal: Optional[bool] = None


class PriceAnalysis(BaseModel):
    """
    Modèle de données pour l'analyse de prix
    """
    market_avg_price: float
    price_difference: float
    price_difference_percentage: float
    is_good_deal: bool
    sample_size: int


class SimilarCarsResponse(BaseModel):
    """
    Modèle de données pour les voitures similaires
    """
    cars: List[Car]
    count: int
    avg_price: float


class CarResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une voiture
    """
    car: Car
    similar_cars: Optional[SimilarCarsResponse] = None
    price_analysis: Optional[PriceAnalysis] = None
    is_favorite: bool = False


class CarsListResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une liste de voitures
    """
    items: List[Car]
    total: int
    page: int
    page_size: int
    pages: int 