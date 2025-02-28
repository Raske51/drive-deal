#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles pour les voitures
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, HttpUrl, validator


class CarBase(BaseModel):
    """
    Modèle de base pour une voiture
    """
    title: str
    brand: str
    model: str
    year: int
    price: float
    mileage: int
    fuel_type: str
    transmission: str
    description: Optional[str] = None
    location: Optional[str] = None
    color: Optional[str] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    power: Optional[int] = None  # Puissance en chevaux
    engine_size: Optional[float] = None  # Cylindrée en litres
    
    @validator('year')
    def year_must_be_valid(cls, v):
        current_year = datetime.now().year
        if v < 1900 or v > current_year + 1:
            raise ValueError(f'L\'année doit être comprise entre 1900 et {current_year + 1}')
        return v
    
    @validator('price')
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Le prix doit être positif')
        return v
    
    @validator('mileage')
    def mileage_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Le kilométrage doit être positif')
        return v


class CarCreate(CarBase):
    """
    Modèle pour la création d'une voiture
    """
    source: str
    source_id: str
    url: HttpUrl
    images: List[HttpUrl] = []
    features: List[str] = []
    metadata: Dict[str, Any] = {}


class CarUpdate(BaseModel):
    """
    Modèle pour la mise à jour d'une voiture
    """
    title: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    color: Optional[str] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    power: Optional[int] = None
    engine_size: Optional[float] = None
    images: Optional[List[HttpUrl]] = None
    features: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    
    @validator('year')
    def year_must_be_valid(cls, v):
        if v is not None:
            current_year = datetime.now().year
            if v < 1900 or v > current_year + 1:
                raise ValueError(f'L\'année doit être comprise entre 1900 et {current_year + 1}')
        return v
    
    @validator('price')
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Le prix doit être positif')
        return v
    
    @validator('mileage')
    def mileage_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Le kilométrage doit être positif')
        return v


class Car(CarBase):
    """
    Modèle complet d'une voiture
    """
    id: str = Field(..., alias="_id")
    source: str
    source_id: str
    url: HttpUrl
    images: List[HttpUrl] = []
    features: List[str] = []
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    price_history: List[Dict[str, Any]] = []
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class CarResponse(BaseModel):
    """
    Modèle pour la réponse d'une voiture
    """
    id: str
    title: str
    brand: str
    model: str
    year: int
    price: float
    mileage: int
    fuel_type: str
    transmission: str
    description: Optional[str] = None
    location: Optional[str] = None
    color: Optional[str] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    power: Optional[int] = None
    engine_size: Optional[float] = None
    source: str
    source_id: str
    url: HttpUrl
    images: List[HttpUrl] = []
    features: List[str] = []
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    price_analysis: Optional[Dict[str, Any]] = None


class CarListResponse(BaseModel):
    """
    Modèle pour la réponse d'une liste de voitures
    """
    items: List[CarResponse]
    total: int
    page: int
    size: int
    pages: int


class PriceHistory(BaseModel):
    """
    Modèle pour l'historique des prix
    """
    car_id: str
    price_changes: List[Dict[str, Any]]


class SimilarCar(BaseModel):
    """
    Modèle pour une voiture similaire
    """
    id: str
    title: str
    brand: str
    model: str
    year: int
    price: float
    mileage: int
    fuel_type: str
    transmission: str
    source: str
    url: HttpUrl
    image: Optional[HttpUrl] = None
    similarity_score: float


class SimilarCarsResponse(BaseModel):
    """
    Modèle pour la réponse des voitures similaires
    """
    car_id: str
    similar_cars: List[SimilarCar] 