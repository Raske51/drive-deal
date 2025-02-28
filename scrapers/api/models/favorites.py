#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les favoris
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class Favorite(BaseModel):
    """
    Modèle de données pour un favori
    """
    id: str = Field(..., description="Identifiant unique du favori")
    user_id: str = Field(..., description="Identifiant de l'utilisateur")
    car_id: str = Field(..., description="Identifiant de l'annonce")
    note: str = Field("", description="Note personnelle")
    created_at: datetime = Field(..., description="Date d'ajout aux favoris")


class FavoriteCreate(BaseModel):
    """
    Modèle de données pour la création d'un favori
    """
    car_id: str = Field(..., description="Identifiant de l'annonce")
    note: Optional[str] = Field(None, description="Note personnelle")


class FavoritesList(BaseModel):
    """
    Modèle de données pour la liste des favoris
    """
    favorites: List[Favorite] = Field(..., description="Liste des favoris")
    cars: List[Dict[str, Any]] = Field(..., description="Liste des annonces correspondantes")
    total: int = Field(..., description="Nombre total de favoris")
    page: int = Field(1, description="Numéro de page")
    page_size: int = Field(20, description="Nombre d'éléments par page")
    total_pages: int = Field(..., description="Nombre total de pages") 