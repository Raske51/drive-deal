#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Configuration pour l'API
"""

import os
import secrets
from typing import List, Optional
from pydantic import BaseSettings, AnyHttpUrl, validator

class Settings(BaseSettings):
    """
    Configuration de l'API
    """
    # Informations sur l'API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DriveDeal API"
    DESCRIPTION: str = "API pour le projet DriveDeal - Agrégateur d'annonces de voitures d'occasion"
    VERSION: str = "1.0.0"
    
    # Sécurité
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Base de données
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_NAME: str = os.getenv("MONGODB_NAME", "drivedeal")
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    @validator("EMAILS_FROM_NAME")
    def get_project_name(cls, v: Optional[str], values: dict) -> str:
        if not v:
            return values["PROJECT_NAME"]
        return v
    
    # Fichiers
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif"]
    
    # Scrapers
    SCRAPER_INTERVAL_MINUTES: int = 60
    SCRAPER_MAX_PAGES: int = 10
    SCRAPER_USER_AGENTS: List[str] = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = "logs/api.log"
    
    # Alertes
    ALERT_CHECK_INTERVAL_MINUTES: int = 30
    
    # Analyse de prix
    PRICE_ANALYSIS_INTERVAL_HOURS: int = 24
    
    # Nettoyage de la base de données
    DB_CLEANUP_INTERVAL_DAYS: int = 7
    DB_CLEANUP_OLDER_THAN_DAYS: int = 90
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Création de l'instance de configuration
settings = Settings()

# Création des répertoires nécessaires
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
if settings.LOG_FILE:
    os.makedirs(os.path.dirname(settings.LOG_FILE), exist_ok=True) 