#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les alertes
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from .car import Car

class AlertBase(BaseModel):
    """
    Modèle de base pour les alertes
    """
    name: str
    keywords: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    mileage_min: Optional[int] = None
    mileage_max: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    good_deals_only: bool = False
    is_active: bool = True
    notify_by_email: bool = True
    notify_by_push: bool = False

class AlertCreate(AlertBase):
    """
    Modèle de données pour la création d'une alerte
    """
    pass

class AlertUpdate(BaseModel):
    """
    Modèle de données pour la mise à jour d'une alerte
    """
    name: Optional[str] = None
    keywords: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    mileage_min: Optional[int] = None
    mileage_max: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    good_deals_only: Optional[bool] = None
    is_active: Optional[bool] = None
    notify_by_email: Optional[bool] = None
    notify_by_push: Optional[bool] = None

class Alert(AlertBase):
    """
    Modèle de données pour une alerte
    """
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None
    last_match_count: int = 0
    total_match_count: int = 0
    
    class Config:
        from_attributes = True

class AlertResponse(Alert):
    """
    Modèle de données pour la réponse d'une alerte
    """
    pass

class AlertMatch(BaseModel):
    """
    Modèle de données pour une correspondance d'alerte
    """
    id: str
    alert_id: str
    car_id: str
    created_at: datetime
    seen: bool = False
    car: Optional[Car] = None
    
    class Config:
        from_attributes = True

class AlertsListResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une liste d'alertes
    """
    items: List[AlertResponse]
    total: int
    page: int
    page_size: int
    pages: int 