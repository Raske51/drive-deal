#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les alertes et les favoris
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from .search import SearchFilters, SortField

class AlertBase(BaseModel):
    """Modèle de base pour les alertes"""
    name: str
    filters: SearchFilters
    sort_by: SortField = SortField.RELEVANCE
    is_active: bool = True
    frequency: str = "daily"  # daily, weekly, instant
    notification_method: str = "email"  # email, push, sms

class AlertCreate(AlertBase):
    """Modèle pour la création d'une alerte"""
    pass

class AlertUpdate(BaseModel):
    """Modèle pour la mise à jour d'une alerte"""
    name: Optional[str] = None
    filters: Optional[SearchFilters] = None
    sort_by: Optional[SortField] = None
    is_active: Optional[bool] = None
    frequency: Optional[str] = None
    notification_method: Optional[str] = None

class Alert(AlertBase):
    """Modèle pour les alertes"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    last_notification: Optional[datetime] = None
    total_notifications: int = 0
    last_results_count: int = 0

class AlertNotification(BaseModel):
    """Modèle pour les notifications d'alerte"""
    id: str
    alert_id: str
    user_id: str
    timestamp: datetime
    new_listings: List[str]  # Liste d'IDs d'annonces
    price_drops: List[Dict[str, Any]]  # [{"car_id": "123", "old_price": 10000, "new_price": 9500}, ...]
    sent: bool = False
    read: bool = False
    method: str  # email, push, sms

class FavoriteBase(BaseModel):
    """Modèle de base pour les favoris"""
    car_id: str
    notes: Optional[str] = None
    tags: List[str] = []

class FavoriteCreate(FavoriteBase):
    """Modèle pour la création d'un favori"""
    pass

class FavoriteUpdate(BaseModel):
    """Modèle pour la mise à jour d'un favori"""
    notes: Optional[str] = None
    tags: Optional[List[str]] = None

class Favorite(FavoriteBase):
    """Modèle pour les favoris"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    car_data: Dict[str, Any]  # Données de l'annonce au moment de l'ajout aux favoris
    price_history: List[Dict[str, Any]] = []  # [{"date": "2023-01-15", "price": 10000}, ...]
    is_available: bool = True  # L'annonce est-elle toujours disponible ?
    is_price_drop: bool = False  # Le prix a-t-il baissé depuis l'ajout aux favoris ?

class FavoritesList(BaseModel):
    """Modèle pour la liste des favoris"""
    favorites: List[Favorite]
    total: int
    page: int
    page_size: int
    total_pages: int

class FavoriteTag(BaseModel):
    """Modèle pour les tags de favoris"""
    id: str
    user_id: str
    name: str
    color: str
    count: int 