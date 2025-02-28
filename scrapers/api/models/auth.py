#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles pour l'authentification
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, validator

class UserBase(BaseModel):
    """
    Modèle de base pour un utilisateur
    """
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """
    Modèle pour la création d'un utilisateur
    """
    password: str

    @validator('password')
    def password_strength(cls, v):
        """
        Valide la force du mot de passe
        """
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        return v

class UserUpdate(BaseModel):
    """
    Modèle pour la mise à jour d'un utilisateur
    """
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    @validator('password')
    def password_strength(cls, v):
        """
        Valide la force du mot de passe
        """
        if v is not None and len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        return v

class User(UserBase):
    """
    Modèle complet d'un utilisateur
    """
    id: str = Field(..., alias="_id")
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class UserResponse(BaseModel):
    """
    Modèle pour la réponse d'un utilisateur
    """
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class TokenData(BaseModel):
    """
    Modèle pour les données d'un token
    """
    sub: str
    exp: datetime
    type: str
    email: Optional[str] = None
    is_admin: Optional[bool] = None

class Token(BaseModel):
    """
    Modèle pour un token
    """
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """
    Modèle pour le payload d'un token
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class LoginRequest(BaseModel):
    """
    Modèle pour une demande de connexion
    """
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    """
    Modèle pour une demande de rafraîchissement de token
    """
    refresh_token: str

class PasswordResetRequest(BaseModel):
    """
    Modèle pour une demande de réinitialisation de mot de passe
    """
    token: str
    new_password: str

    @validator('new_password')
    def password_strength(cls, v):
        """
        Valide la force du mot de passe
        """
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        return v

class PasswordResetRequestEmail(BaseModel):
    """
    Modèle pour une demande de réinitialisation de mot de passe par email
    """
    email: EmailStr

class UserPreferences(BaseModel):
    """Préférences utilisateur"""
    theme: str = "light"  # light, dark
    notifications_enabled: bool = True
    email_notifications: bool = True
    saved_searches_notifications: bool = True
    price_drop_notifications: bool = True
    new_listings_notifications: bool = True
    language: str = "fr"
    currency: str = "EUR"
    distance_unit: str = "km"  # km, miles
    default_search_radius: int = 50
    default_sort: str = "relevance"
    default_page_size: int = 20
    favorite_brands: List[str] = []
    excluded_sources: List[str] = []

class UserActivity(BaseModel):
    """Activité utilisateur"""
    id: str
    user_id: str
    activity_type: str  # search, view, favorite, alert, login, etc.
    timestamp: datetime
    details: Dict[str, Any] = {}

class UserStats(BaseModel):
    """Statistiques utilisateur"""
    user_id: str
    searches_count: int
    viewed_listings_count: int
    favorite_listings_count: int
    saved_searches_count: int
    alerts_count: int
    days_active: int
    last_activity: Optional[datetime] = None
    most_viewed_brands: List[Dict[str, Any]] = []
    most_viewed_models: List[Dict[str, Any]] = []
    price_range: Dict[str, int] = {}  # {"min": 5000, "max": 20000}
    activity_by_day: Dict[str, int] = {} 