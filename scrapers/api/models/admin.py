#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les fonctionnalités d'administration
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AdminStats(BaseModel):
    """
    Modèle de données pour les statistiques d'administration
    """
    total_cars: int
    cars_by_source: Dict[str, int]
    total_users: int
    active_users: int
    new_users_30d: int
    active_users_7d: int
    total_favorites: int
    total_alerts: int
    scraper_jobs: Dict[str, int]
    errors_24h: int
    storage_stats: Dict[str, Any]


class SystemLog(BaseModel):
    """
    Modèle de données pour un log système
    """
    id: str
    timestamp: datetime
    level: str  # "INFO", "WARNING", "ERROR", "CRITICAL"
    source: str  # "api", "scraper", "database", "auth", etc.
    message: str
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class SystemLogResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une liste de logs système
    """
    items: List[SystemLog]
    total: int
    page: int
    page_size: int
    pages: int


class ScraperJobBase(BaseModel):
    """
    Modèle de base pour les tâches de scraping
    """
    source: str
    params: Dict[str, Any] = {}
    priority: int = 1  # 1 (basse) à 5 (haute)
    max_pages: Optional[int] = None
    max_items: Optional[int] = None
    scheduled_for: Optional[datetime] = None


class ScraperJobCreate(ScraperJobBase):
    """
    Modèle de données pour la création d'une tâche de scraping
    """
    pass


class ScraperJob(ScraperJobBase):
    """
    Modèle de données pour une tâche de scraping
    """
    id: str
    status: str  # "pending", "running", "completed", "failed"
    created_at: datetime
    updated_at: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error: Optional[str] = None
    results: Dict[str, Any] = {}
    
    class Config:
        from_attributes = True


class ScraperJobResponse(ScraperJob):
    """
    Modèle de données pour la réponse d'une tâche de scraping
    """
    pass


class ScraperJobsListResponse(BaseModel):
    """
    Modèle de données pour la réponse d'une liste de tâches de scraping
    """
    items: List[ScraperJobResponse]
    total: int
    page: int
    page_size: int
    pages: int 