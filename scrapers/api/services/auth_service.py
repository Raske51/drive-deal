#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service d'authentification pour l'API
"""

import logging
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Union

import jwt
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from pydantic import EmailStr

from ..config import settings
from ..models.auth import User, UserCreate, UserUpdate, TokenData

logger = logging.getLogger(__name__)

class AuthService:
    """
    Service pour gérer l'authentification des utilisateurs
    """
    
    def __init__(self):
        """
        Initialise le service d'authentification
        """
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_minutes = settings.refresh_token_expire_minutes
        self.secret_key = settings.jwt_secret_key
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Vérifie si le mot de passe en clair correspond au mot de passe hashé
        """
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """
        Génère un hash pour le mot de passe
        """
        return self.pwd_context.hash(password)
    
    async def get_user_by_email(self, db: AsyncIOMotorDatabase, email: EmailStr) -> Optional[User]:
        """
        Récupère un utilisateur par son email
        """
        user_dict = await db.users.find_one({"email": email})
        if user_dict:
            return User(**user_dict)
        return None
    
    async def get_user_by_id(self, db: AsyncIOMotorDatabase, user_id: str) -> Optional[User]:
        """
        Récupère un utilisateur par son ID
        """
        user_dict = await db.users.find_one({"_id": user_id})
        if user_dict:
            return User(**user_dict)
        return None
    
    async def authenticate_user(self, db: AsyncIOMotorDatabase, email: EmailStr, password: str) -> Optional[User]:
        """
        Authentifie un utilisateur avec son email et son mot de passe
        """
        user = await self.get_user_by_email(db, email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_token(self, data: Dict[str, Any], token_type: str, expires_delta: Optional[timedelta] = None) -> str:
        """
        Crée un token JWT
        """
        to_encode = data.copy()
        
        # Définir l'expiration du token
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        elif token_type == "access":
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        elif token_type == "refresh":
            expire = datetime.utcnow() + timedelta(minutes=self.refresh_token_expire_minutes)
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        # Ajouter les informations au token
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": token_type
        })
        
        # Encoder le token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Décode un token JWT
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError:
            return None
    
    def create_access_token(self, user: User) -> str:
        """
        Crée un token d'accès pour un utilisateur
        """
        data = {
            "sub": user.id,
            "email": user.email,
            "is_admin": user.is_admin
        }
        return self.create_token(data, "access")
    
    def create_refresh_token(self, user: User) -> str:
        """
        Crée un token de rafraîchissement pour un utilisateur
        """
        data = {
            "sub": user.id
        }
        return self.create_token(data, "refresh")
    
    async def register_user(self, db: AsyncIOMotorDatabase, user_create: UserCreate) -> User:
        """
        Enregistre un nouvel utilisateur
        """
        # Vérifier si l'email est déjà utilisé
        existing_user = await self.get_user_by_email(db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        
        # Créer l'utilisateur
        user_dict = user_create.dict()
        user_dict.pop("password")
        user_dict["hashed_password"] = self.get_password_hash(user_create.password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        user_dict["is_admin"] = False
        user_dict["_id"] = secrets.token_hex(16)
        
        # Insérer l'utilisateur dans la base de données
        await db.users.insert_one(user_dict)
        
        # Retourner l'utilisateur créé
        return User(**user_dict)
    
    async def update_user(self, db: AsyncIOMotorDatabase, user_id: str, user_update: UserUpdate) -> Optional[User]:
        """
        Met à jour un utilisateur
        """
        # Récupérer l'utilisateur
        user = await self.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Mettre à jour les champs
        update_data = user_update.dict(exclude_unset=True)
        
        # Hasher le mot de passe si nécessaire
        if "password" in update_data:
            update_data["hashed_password"] = self.get_password_hash(update_data.pop("password"))
        
        # Mettre à jour la date de modification
        update_data["updated_at"] = datetime.utcnow()
        
        # Mettre à jour l'utilisateur dans la base de données
        await db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        # Récupérer l'utilisateur mis à jour
        return await self.get_user_by_id(db, user_id)
    
    async def delete_user(self, db: AsyncIOMotorDatabase, user_id: str) -> bool:
        """
        Supprime un utilisateur
        """
        # Supprimer l'utilisateur
        result = await db.users.delete_one({"_id": user_id})
        
        # Vérifier si l'utilisateur a été supprimé
        return result.deleted_count > 0
    
    async def update_last_login(self, db: AsyncIOMotorDatabase, user_id: str) -> None:
        """
        Met à jour la date de dernière connexion d'un utilisateur
        """
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
    
    async def refresh_token(self, db: AsyncIOMotorDatabase, refresh_token: str) -> Dict[str, str]:
        """
        Rafraîchit un token d'accès à partir d'un token de rafraîchissement
        """
        # Décoder le token
        payload = self.decode_token(refresh_token)
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Vérifier le type de token
        if payload.get("type") != "refresh":
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
        user = await self.get_user_by_id(db, user_id)
        
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
        
        # Créer un nouveau token d'accès
        access_token = self.create_access_token(user)
        
        # Retourner les tokens
        return {
            "access_token": access_token,
            "token_type": "bearer"
        } 