#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Dépendances pour l'API
"""

import os
import logging
from typing import Optional, Tuple, Dict, Any
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .models.auth import TokenData, User
from .config import settings
from .services.auth_service import AuthService

# Configuration du logger
logger = logging.getLogger(__name__)

# Configuration de l'authentification
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")

# Connexion à la base de données
client = AsyncIOMotorClient(settings.MONGODB_URL)
database = client[settings.MONGODB_NAME]

# Dépendances pour la pagination
def pagination_params(
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page")
) -> Tuple[int, int]:
    """
    Paramètres de pagination
    """
    return page, page_size

# Dépendances pour la base de données
async def get_db() -> AsyncIOMotorDatabase:
    """
    Récupère la connexion à la base de données
    """
    return database

# Dépendances pour l'authentification
async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Récupère l'utilisateur connecté à partir du token JWT
    """
    try:
        # Décoder le token
        payload = auth_service.decode_token(token)
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Vérifier le type de token
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Récupérer l'ID de l'utilisateur
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Récupérer l'utilisateur
        db = await get_db()
        user = await auth_service.get_user_by_id(db, user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Vérifier si l'utilisateur est actif
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur inactif",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Retourner les informations de l'utilisateur
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_admin": user.is_admin
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Impossible de valider les informations d'identification",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[Dict[str, Any]]:
    """
    Récupère l'utilisateur connecté à partir du token JWT (optionnel)
    """
    if token is None:
        return None
    
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Vérifie si l'utilisateur connecté est un administrateur
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit. Vous devez être administrateur pour accéder à cette ressource."
        )
    
    return current_user

# Dépendances pour les services
async def get_car_service():
    """
    Récupère le service pour les voitures
    """
    from .services.car_service import CarService
    return CarService()

async def get_search_service():
    """
    Récupère le service pour la recherche
    """
    from .services.search_service import SearchService
    return SearchService()

async def get_stats_service():
    """
    Récupère le service pour les statistiques
    """
    from .services.stats_service import StatsService
    return StatsService()

async def get_auth_service():
    """
    Récupère le service pour l'authentification
    """
    from .services.auth_service import AuthService
    return AuthService()

async def get_favorites_service():
    """
    Récupère le service pour les favoris
    """
    from .services.favorites_service import FavoritesService
    return FavoritesService()

async def get_alerts_service():
    """
    Récupère le service pour les alertes
    """
    from .services.alerts_service import AlertsService
    return AlertsService()

async def get_admin_service():
    """
    Récupère le service pour l'administration
    """
    from .services.admin_service import AdminService
    return AdminService()

# Service d'authentification
auth_service = AuthService() 