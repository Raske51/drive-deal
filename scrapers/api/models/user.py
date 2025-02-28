#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les utilisateurs et l'authentification
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    """
    Modèle de base pour les utilisateurs
    """
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    """
    Modèle de données pour la création d'un utilisateur
    """
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    """
    Modèle de données pour la mise à jour d'un utilisateur
    """
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    """
    Modèle de données pour un utilisateur
    """
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    email_verified: bool = False
    
    class Config:
        from_attributes = True

class UserResponse(UserBase):
    """
    Modèle de données pour la réponse d'un utilisateur
    """
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    email_verified: bool

class TokenResponse(BaseModel):
    """
    Modèle de données pour la réponse d'un token
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class PasswordResetRequest(BaseModel):
    """
    Modèle de données pour une demande de réinitialisation de mot de passe
    """
    token: str
    new_password: str

class UserListResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une liste d'utilisateurs
    """
    items: List[User]
    total: int
    page: int
    page_size: int
    pages: int 