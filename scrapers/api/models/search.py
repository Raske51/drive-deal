#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles pour la recherche
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator
from datetime import datetime

class SortField(str, Enum):
    """Champs de tri disponibles"""
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    YEAR_ASC = "year_asc"
    YEAR_DESC = "year_desc"
    MILEAGE_ASC = "mileage_asc"
    MILEAGE_DESC = "mileage_desc"
    CREATED_AT_ASC = "created_at_asc"
    CREATED_AT_DESC = "created_at_desc"
    RELEVANCE = "relevance"
    GOOD_DEAL = "good_deal"

class FuelType(str, Enum):
    """Types de carburant disponibles"""
    PETROL = "essence"
    DIESEL = "diesel"
    HYBRID = "hybride"
    ELECTRIC = "electrique"
    LPG = "gpl"
    OTHER = "autre"

class TransmissionType(str, Enum):
    """Types de transmission disponibles"""
    MANUAL = "manuelle"
    AUTOMATIC = "automatique"
    SEMI_AUTO = "semi-automatique"

class SearchFilters(BaseModel):
    """Filtres de recherche pour les voitures"""
    brands: Optional[List[str]] = None
    models: Optional[List[str]] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    mileage_min: Optional[int] = None
    mileage_max: Optional[int] = None
    fuel_types: Optional[List[FuelType]] = None
    transmission_types: Optional[List[TransmissionType]] = None
    location: Optional[str] = None
    radius: Optional[int] = None  # Rayon en km
    keywords: Optional[List[str]] = None
    sources: Optional[List[str]] = None
    good_deals_only: bool = False
    seller_type: Optional[str] = None
    features: Optional[Dict[str, str]] = None

class SearchRequest(BaseModel):
    """Requête de recherche pour les voitures"""
    filters: SearchFilters = Field(default_factory=SearchFilters)
    sort_by: SortField = SortField.RELEVANCE
    page: int = 1
    page_size: int = 20
    include_similar: bool = False
    include_price_analysis: bool = False

class SearchHistory(BaseModel):
    """Historique de recherche"""
    id: str
    user_id: Optional[str] = None
    filters: SearchFilters
    sort_by: SortField
    created_at: str
    results_count: int
    saved: bool = False
    name: Optional[str] = None

class SearchFilter(BaseModel):
    """
    Modèle pour les filtres de recherche
    """
    brand: Optional[List[str]] = None
    model: Optional[List[str]] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    mileage_min: Optional[int] = None
    mileage_max: Optional[int] = None
    fuel_type: Optional[List[str]] = None
    transmission: Optional[List[str]] = None
    location: Optional[str] = None
    color: Optional[List[str]] = None
    doors_min: Optional[int] = None
    doors_max: Optional[int] = None
    seats_min: Optional[int] = None
    seats_max: Optional[int] = None
    power_min: Optional[int] = None
    power_max: Optional[int] = None
    engine_size_min: Optional[float] = None
    engine_size_max: Optional[float] = None
    features: Optional[List[str]] = None
    source: Optional[List[str]] = None
    
    @validator('year_min', 'year_max')
    def year_must_be_valid(cls, v):
        if v is not None and (v < 1900 or v > 2100):
            raise ValueError('L\'année doit être comprise entre 1900 et 2100')
        return v
    
    @validator('price_min', 'price_max')
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Le prix doit être positif')
        return v
    
    @validator('mileage_min', 'mileage_max')
    def mileage_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Le kilométrage doit être positif')
        return v

class SearchQuery(BaseModel):
    """
    Modèle pour une requête de recherche
    """
    query: Optional[str] = None
    filters: Optional[SearchFilter] = None
    sort_by: Optional[str] = Field(None, description="Champ de tri (price, year, mileage, created_at)")
    sort_order: Optional[str] = Field("asc", description="Ordre de tri (asc, desc)")
    page: int = Field(1, ge=1, description="Numéro de page")
    size: int = Field(20, ge=1, le=100, description="Nombre d'éléments par page")

class SearchResult(BaseModel):
    """
    Modèle de données pour un résultat de recherche
    """
    cars: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int
    query: SearchQuery

class SearchSuggestion(BaseModel):
    """
    Modèle pour une suggestion de recherche
    """
    type: str  # brand, model, location, etc.
    value: str
    count: int

class SearchSuggestionResponse(BaseModel):
    """
    Modèle pour la réponse des suggestions de recherche
    """
    suggestions: List[SearchSuggestion]

class SearchFacet(BaseModel):
    """
    Modèle pour une facette de recherche
    """
    name: str
    values: List[Dict[str, Any]]

class SearchFacetsResponse(BaseModel):
    """
    Modèle pour la réponse des facettes de recherche
    """
    facets: List[SearchFacet]

class SavedSearch(BaseModel):
    """
    Modèle pour une recherche sauvegardée
    """
    id: str = Field(..., alias="_id")
    user_id: str
    name: str
    query: Optional[str] = None
    filters: Optional[SearchFilter] = None
    created_at: Any
    updated_at: Any
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class SavedSearchCreate(BaseModel):
    """
    Modèle pour la création d'une recherche sauvegardée
    """
    name: str
    query: Optional[str] = None
    filters: Optional[SearchFilter] = None

class SavedSearchUpdate(BaseModel):
    """
    Modèle pour la mise à jour d'une recherche sauvegardée
    """
    name: Optional[str] = None
    query: Optional[str] = None
    filters: Optional[SearchFilter] = None

class SavedSearchResponse(BaseModel):
    """
    Modèle pour la réponse d'une recherche sauvegardée
    """
    id: str
    name: str
    query: Optional[str] = None
    filters: Optional[SearchFilter] = None
    created_at: Any
    updated_at: Any

class SavedSearchListResponse(BaseModel):
    """
    Modèle pour la réponse d'une liste de recherches sauvegardées
    """
    items: List[SavedSearchResponse]
    total: int 