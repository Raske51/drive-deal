#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Modèles de données pour les statistiques et analyses de marché
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PriceStats(BaseModel):
    """
    Modèle de données pour les statistiques de prix
    """
    min_price: int = Field(..., description="Prix minimum")
    max_price: int = Field(..., description="Prix maximum")
    avg_price: float = Field(..., description="Prix moyen")
    median_price: float = Field(..., description="Prix médian")
    count: int = Field(..., description="Nombre d'annonces")
    brand: Optional[str] = Field(None, description="Marque")
    model: Optional[str] = Field(None, description="Modèle")
    min_year: Optional[int] = Field(None, description="Année minimum")
    max_year: Optional[int] = Field(None, description="Année maximum")


class PriceHistory(BaseModel):
    """
    Modèle de données pour l'historique des prix
    """
    dates: List[str] = Field(..., description="Dates")
    prices: List[float] = Field(..., description="Prix moyens")
    counts: List[int] = Field(..., description="Nombre d'annonces")
    brand: Optional[str] = Field(None, description="Marque")
    model: Optional[str] = Field(None, description="Modèle")
    period: str = Field("month", description="Période (day, week, month, year)")


class MarketTrends(BaseModel):
    """
    Modèle de données pour les tendances du marché
    """
    price_trend: float = Field(..., description="Tendance des prix en pourcentage")
    volume_trend: float = Field(..., description="Tendance du volume en pourcentage")
    current_avg_price: float = Field(..., description="Prix moyen actuel")
    current_volume: int = Field(..., description="Volume actuel")
    previous_avg_price: float = Field(..., description="Prix moyen précédent")
    previous_volume: int = Field(..., description="Volume précédent")
    period_days: int = Field(30, description="Période en jours")


class MarketOverview(BaseModel):
    """
    Modèle de données pour la vue d'ensemble du marché
    """
    total_listings: int
    avg_price: float
    avg_mileage: float
    avg_age: float
    good_deals_count: int
    good_deals_percentage: float
    sources: Dict[str, int]
    fuel_types: Dict[str, int]
    transmission_types: Dict[str, int]
    new_listings_count: int
    new_listings_percentage: float


class PriceDistribution(BaseModel):
    """
    Modèle de données pour la distribution des prix
    """
    min_price: float
    max_price: float
    bins: List[str]  # Intervalles de prix (ex: "10000-15000")
    bin_counts: List[int]  # Nombre d'annonces dans chaque intervalle


class PriceTrend(BaseModel):
    """
    Modèle de données pour les tendances de prix
    """
    dates: List[str]  # Dates au format "YYYY-MM-DD"
    prices: List[float]  # Prix moyens pour chaque date
    volumes: List[int]  # Nombre d'annonces pour chaque date
    price_change: float  # Variation de prix sur la période
    price_change_percentage: float  # Variation de prix en pourcentage


class PopularBrand(BaseModel):
    """
    Modèle de données pour une marque populaire
    """
    brand: str
    count: int
    avg_price: float
    good_deals_count: int
    good_deals_percentage: float


class PopularModel(BaseModel):
    """
    Modèle de données pour un modèle populaire
    """
    brand: str
    model: str
    count: int
    avg_price: float
    avg_year: float
    avg_mileage: float
    good_deals_count: int
    good_deals_percentage: float


class PriceByAge(BaseModel):
    """
    Modèle de données pour les prix par âge
    """
    years: List[int]  # Années de fabrication
    prices: List[float]  # Prix moyens pour chaque année
    counts: List[int]  # Nombre d'annonces pour chaque année
    depreciation_rate: float  # Taux de dépréciation annuel moyen (%)


class PriceByMileage(BaseModel):
    """
    Modèle de données pour les prix par kilométrage
    """
    mileage_ranges: List[str]  # Intervalles de kilométrage (ex: "0-10000")
    prices: List[float]  # Prix moyens pour chaque intervalle
    counts: List[int]  # Nombre d'annonces pour chaque intervalle
    price_per_km: float  # Prix par kilomètre (dépréciation)


class MarketInsight(BaseModel):
    """
    Modèle de données pour un insight sur le marché
    """
    title: str
    description: str
    type: str  # "price_trend", "good_deals", "market_supply", "depreciation", "mileage_impact"
    value: float  # Valeur associée à l'insight


class BrandItem(BaseModel):
    """
    Modèle de données pour un élément de distribution de marque
    """
    name: str = Field(..., description="Nom de la marque")
    count: int = Field(..., description="Nombre d'annonces")
    percentage: float = Field(..., description="Pourcentage")
    avg_price: float = Field(..., description="Prix moyen")


class BrandDistribution(BaseModel):
    """
    Modèle de données pour la distribution des marques
    """
    brands: List[BrandItem] = Field(..., description="Distribution des marques")
    total: int = Field(..., description="Nombre total d'annonces")


class ModelItem(BaseModel):
    """
    Modèle de données pour un élément de distribution de modèle
    """
    name: str = Field(..., description="Nom du modèle")
    count: int = Field(..., description="Nombre d'annonces")
    percentage: float = Field(..., description="Pourcentage")
    avg_price: float = Field(..., description="Prix moyen")


class ModelDistribution(BaseModel):
    """
    Modèle de données pour la distribution des modèles
    """
    brand: str = Field(..., description="Marque")
    models: List[ModelItem] = Field(..., description="Distribution des modèles")
    total: int = Field(..., description="Nombre total d'annonces")


class YearDistribution(BaseModel):
    """Distribution des années de mise en circulation"""
    ranges: List[Dict[str, Any]]  # {"year": 2018, "count": 45}
    average: float
    median: float
    oldest: int
    newest: int


class MileageDistribution(BaseModel):
    """Distribution des kilométrages"""
    ranges: List[Dict[str, Any]]  # {"min": 0, "max": 10000, "count": 78}
    average: float
    median: float
    min_mileage: int
    max_mileage: int


class FuelDistribution(BaseModel):
    """Distribution des types de carburant"""
    distribution: Dict[str, int]  # {"diesel": 120, "essence": 85, ...}
    total: int


class TransmissionDistribution(BaseModel):
    """Distribution des types de transmission"""
    distribution: Dict[str, int]  # {"manuelle": 150, "automatique": 75, ...}
    total: int


class LocationDistribution(BaseModel):
    """Distribution géographique"""
    by_region: Dict[str, int]  # {"ile-de-france": 250, "paca": 180, ...}
    by_department: Dict[str, int]  # {"75": 120, "13": 85, ...}
    total: int


class SourceDistribution(BaseModel):
    """Distribution par source"""
    distribution: Dict[str, int]  # {"lacentrale": 350, "leboncoin": 280, ...}
    total: int


class PriceEvolution(BaseModel):
    """Évolution des prix dans le temps"""
    by_date: List[Dict[str, Any]]  # [{"date": "2023-01", "average": 15000, "median": 14000, "count": 450}, ...]
    by_brand: Dict[str, List[Dict[str, Any]]]  # {"renault": [{"date": "2023-01", "average": 12000, ...}], ...}
    by_model: Dict[str, List[Dict[str, Any]]]  # {"clio": [{"date": "2023-01", "average": 10000, ...}], ...}


class MarketStats(BaseModel):
    """Statistiques globales du marché"""
    total_listings: int
    new_listings_today: int
    new_listings_week: int
    new_listings_month: int
    average_price: float
    median_price: float
    average_days_online: float
    price_distribution: PriceDistribution
    year_distribution: YearDistribution
    mileage_distribution: MileageDistribution
    fuel_distribution: FuelDistribution
    transmission_distribution: TransmissionDistribution
    brand_distribution: BrandDistribution
    model_distribution: ModelDistribution
    location_distribution: LocationDistribution
    source_distribution: SourceDistribution
    price_evolution: PriceEvolution


class BrandStats(BaseModel):
    """Statistiques pour une marque spécifique"""
    brand: str
    total_listings: int
    average_price: float
    median_price: float
    price_distribution: PriceDistribution
    year_distribution: YearDistribution
    mileage_distribution: MileageDistribution
    model_distribution: Dict[str, int]
    price_evolution: List[Dict[str, Any]]
    popular_features: List[Dict[str, Any]]  # [{"feature": "GPS", "count": 85}, ...]


class ModelStats(BaseModel):
    """Statistiques pour un modèle spécifique"""
    brand: str
    model: str
    total_listings: int
    average_price: float
    median_price: float
    price_distribution: PriceDistribution
    year_distribution: YearDistribution
    mileage_distribution: MileageDistribution
    price_evolution: List[Dict[str, Any]]
    popular_features: List[Dict[str, Any]]
    price_by_year: Dict[int, Dict[str, float]]  # {2018: {"average": 12000, "median": 11500}, ...}
    price_by_mileage: List[Dict[str, Any]]  # [{"min": 0, "max": 10000, "average": 15000, "median": 14500}, ...]


class PriceAnalysis(BaseModel):
    """Analyse de prix pour une annonce spécifique"""
    car_id: str
    market_price: float
    price_difference: float
    price_difference_percentage: float
    is_good_deal: bool
    confidence_score: float  # 0-1
    similar_listings: List[Dict[str, Any]]
    price_factors: Dict[str, float]  # {"year": -500, "mileage": -1000, "options": +800, ...}
    recommendation: str 