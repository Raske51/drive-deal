#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les favoris
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

from .car import Car

class FavoriteBase(BaseModel):
    """
    Modèle de base pour les favoris
    """
    car_id: str
    note: Optional[int] = Field(None, ge=1, le=5)  # Note de 1 à 5
    comments: Optional[str] = None

class FavoriteCreate(FavoriteBase):
    """
    Modèle de données pour la création d'un favori
    """
    pass

class Favorite(FavoriteBase):
    """
    Modèle de données pour un favori
    """
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FavoriteResponse(Favorite):
    """
    Modèle de données pour la réponse d'un favori
    """
    car: Optional[Car] = None 