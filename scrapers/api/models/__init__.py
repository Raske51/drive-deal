#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Package des modèles pour l'API
"""

from .car import (
    Car, CarCreate, CarUpdate, CarResponse, CarsListResponse,
    PriceAnalysis, SimilarCarsResponse
)

from .search import (
    SearchQuery, SearchSuggestion
)

from .stats import (
    MarketOverview, PriceDistribution, PriceTrend,
    PopularBrand, PopularModel, PriceByAge,
    PriceByMileage, MarketInsight
)

from .user import (
    User, UserCreate, UserUpdate, UserResponse,
    TokenResponse, PasswordResetRequest, UserListResponse
)

from .favorite import (
    Favorite, FavoriteCreate, FavoriteResponse
)

from .alert import (
    Alert, AlertCreate, AlertUpdate, AlertResponse,
    AlertMatch, AlertsListResponse
)

from .admin import (
    AdminStats, SystemLog, SystemLogResponse,
    ScraperJob, ScraperJobCreate, ScraperJobResponse, ScraperJobsListResponse
)

__all__ = [
    "auth",
    "cars",
    "search",
    "stats",
    "favorites",
    "alerts",
    "admin"
] 