#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routes pour l'authentification et la gestion des utilisateurs
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr

from ..models import (
    User, UserCreate, UserUpdate, Token, UserPreferences,
    LoginRequest, PasswordResetRequest, PasswordReset, ChangePasswordRequest,
    RefreshTokenRequest, UserResponse, TokenResponse
)
from ..dependencies import (
    get_current_user, get_current_active_user, get_db,
    get_auth_service
)
from ..services.auth_service import AuthService

# Configuration du logger
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={401: {"description": "Non autorisé"}},
)

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user: UserCreate,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Enregistre un nouvel utilisateur
    """
    try:
        # Vérifier si l'email existe déjà
        existing_user = await auth_service.get_user_by_email(db=db, email=user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà"
            )
        
        # Vérifier si le nom d'utilisateur existe déjà
        existing_user = await auth_service.get_user_by_username(db=db, username=user.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec ce nom d'utilisateur existe déjà"
            )
        
        # Créer l'utilisateur
        new_user = await auth_service.create_user(db=db, user=user)
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement de l'utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'enregistrement de l'utilisateur"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authentifie un utilisateur et retourne un token JWT
    """
    try:
        token = await auth_service.authenticate_user(
            db=db,
            username=form_data.username,
            password=form_data.password
        )
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nom d'utilisateur ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return token
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'authentification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'authentification"
        )

@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: LoginRequest,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authentifie un utilisateur via JSON et retourne un token JWT
    """
    try:
        token = await auth_service.authenticate_user(
            db=db,
            username=login_data.username,
            password=login_data.password,
            remember_me=login_data.remember_me
        )
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nom d'utilisateur ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return token
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'authentification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'authentification"
        )

@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Rafraîchit un token JWT expiré
    """
    try:
        new_token = await auth_service.refresh_token(
            db=db,
            refresh_token=refresh_data.refresh_token
        )
        
        if not new_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de rafraîchissement invalide ou expiré",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return new_token
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du rafraîchissement du token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du rafraîchissement du token"
        )

@router.post("/password-reset-request", status_code=status.HTTP_204_NO_CONTENT)
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Demande de réinitialisation de mot de passe
    """
    try:
        await auth_service.request_password_reset(
            db=db,
            email=reset_request.email
        )
        return {"detail": "Si l'email existe, un lien de réinitialisation a été envoyé"}
    except Exception as e:
        logger.error(f"Erreur lors de la demande de réinitialisation de mot de passe: {str(e)}")
        # Ne pas révéler si l'email existe ou non
        return {"detail": "Si l'email existe, un lien de réinitialisation a été envoyé"}

@router.post("/password-reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    reset_data: PasswordReset,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Réinitialise le mot de passe avec un token
    """
    try:
        result = await auth_service.reset_password(
            db=db,
            token=reset_data.token,
            new_password=reset_data.new_password
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token invalide ou expiré"
            )
        
        return {"detail": "Mot de passe réinitialisé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la réinitialisation du mot de passe: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la réinitialisation du mot de passe"
        )

@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_data: ChangePasswordRequest,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Change le mot de passe de l'utilisateur connecté
    """
    try:
        result = await auth_service.change_password(
            db=db,
            user_id=current_user.id,
            current_password=password_data.current_password,
            new_password=password_data.new_password
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mot de passe actuel incorrect"
            )
        
        return {"detail": "Mot de passe changé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du changement de mot de passe: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du changement de mot de passe"
        )

@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les informations de l'utilisateur connecté
    """
    return current_user

@router.put("/me", response_model=User)
async def update_current_user(
    user_data: UserUpdate,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Met à jour les informations de l'utilisateur connecté
    """
    try:
        updated_user = await auth_service.update_user(
            db=db,
            user_id=current_user.id,
            user_data=user_data
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour de l'utilisateur"
        )

@router.get("/me/preferences", response_model=UserPreferences)
async def get_user_preferences(
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les préférences de l'utilisateur connecté
    """
    try:
        preferences = await auth_service.get_user_preferences(
            db=db,
            user_id=current_user.id
        )
        return preferences
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des préférences utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des préférences utilisateur"
        )

@router.put("/me/preferences", response_model=UserPreferences)
async def update_user_preferences(
    preferences: UserPreferences,
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Met à jour les préférences de l'utilisateur connecté
    """
    try:
        updated_preferences = await auth_service.update_user_preferences(
            db=db,
            user_id=current_user.id,
            preferences=preferences
        )
        return updated_preferences
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour des préférences utilisateur: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour des préférences utilisateur"
        )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    db = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Supprime le compte de l'utilisateur connecté
    """
    try:
        result = await auth_service.delete_user(
            db=db,
            user_id=current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        return {"detail": "Compte supprimé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du compte: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du compte"
        ) 