#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Routers pour l'API
"""

from .cars import router as cars_router
from .search import router as search_router
from .stats import router as stats_router
from .auth import router as auth_router
from .favorites import router as favorites_router
from .alerts import router as alerts_router
from .admin import router as admin_router

__all__ = [
    "cars_router",
    "search_router",
    "stats_router",
    "auth_router",
    "favorites_router",
    "alerts_router",
    "admin_router"
] 