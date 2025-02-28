#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Service pour les statistiques et analyses de marché
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..models import (
    MarketOverview, PriceDistribution, PriceTrend,
    PopularBrand, PopularModel, PriceByAge,
    PriceByMileage, MarketInsight
)

logger = logging.getLogger(__name__)

class StatsService:
    """
    Service pour les statistiques et analyses de marché
    """
    
    async def get_market_overview(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None
    ) -> MarketOverview:
        """
        Récupère une vue d'ensemble du marché
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Récupérer le nombre total d'annonces
            total_listings = await db.cars.count_documents(query)
            
            # Récupérer le prix moyen
            avg_price_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": None, "avg_price": {"$avg": "$price"}}}
            ])
            avg_price_doc = await avg_price_cursor.to_list(length=1)
            avg_price = avg_price_doc[0]["avg_price"] if avg_price_doc else 0
            
            # Récupérer le kilométrage moyen
            avg_mileage_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": None, "avg_mileage": {"$avg": "$mileage"}}}
            ])
            avg_mileage_doc = await avg_mileage_cursor.to_list(length=1)
            avg_mileage = avg_mileage_doc[0]["avg_mileage"] if avg_mileage_doc else 0
            
            # Récupérer l'âge moyen
            current_year = datetime.now().year
            avg_age_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": None, "avg_year": {"$avg": "$year"}}}
            ])
            avg_age_doc = await avg_age_cursor.to_list(length=1)
            avg_age = current_year - avg_age_doc[0]["avg_year"] if avg_age_doc else 0
            
            # Récupérer le nombre de bonnes affaires
            good_deals_count = await db.cars.count_documents({**query, "is_good_deal": True})
            
            # Récupérer le nombre d'annonces par source
            sources_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": "$source", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ])
            sources = {}
            async for doc in sources_cursor:
                sources[doc["_id"]] = doc["count"]
            
            # Récupérer le nombre d'annonces par type de carburant
            fuel_types_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": "$fuel_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ])
            fuel_types = {}
            async for doc in fuel_types_cursor:
                if doc["_id"]:  # Ignorer les valeurs nulles
                    fuel_types[doc["_id"]] = doc["count"]
            
            # Récupérer le nombre d'annonces par type de transmission
            transmission_types_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {"_id": "$transmission", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ])
            transmission_types = {}
            async for doc in transmission_types_cursor:
                if doc["_id"]:  # Ignorer les valeurs nulles
                    transmission_types[doc["_id"]] = doc["count"]
            
            # Récupérer les nouvelles annonces des 7 derniers jours
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            new_listings_count = await db.cars.count_documents({
                **query,
                "created_at": {"$gte": seven_days_ago}
            })
            
            return MarketOverview(
                total_listings=total_listings,
                avg_price=round(avg_price, 2),
                avg_mileage=round(avg_mileage, 2),
                avg_age=round(avg_age, 2),
                good_deals_count=good_deals_count,
                good_deals_percentage=round((good_deals_count / total_listings) * 100, 2) if total_listings > 0 else 0,
                sources=sources,
                fuel_types=fuel_types,
                transmission_types=transmission_types,
                new_listings_count=new_listings_count,
                new_listings_percentage=round((new_listings_count / total_listings) * 100, 2) if total_listings > 0 else 0
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la vue d'ensemble du marché: {str(e)}")
            return MarketOverview(
                total_listings=0,
                avg_price=0,
                avg_mileage=0,
                avg_age=0,
                good_deals_count=0,
                good_deals_percentage=0,
                sources={},
                fuel_types={},
                transmission_types={},
                new_listings_count=0,
                new_listings_percentage=0
            )
    
    async def get_price_distribution(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        bins: int = 10
    ) -> PriceDistribution:
        """
        Récupère la distribution des prix
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Récupérer les prix min et max
            min_max_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {
                    "_id": None,
                    "min_price": {"$min": "$price"},
                    "max_price": {"$max": "$price"}
                }}
            ])
            min_max_doc = await min_max_cursor.to_list(length=1)
            
            if not min_max_doc:
                return PriceDistribution(
                    min_price=0,
                    max_price=0,
                    bins=[],
                    bin_counts=[]
                )
            
            min_price = min_max_doc[0]["min_price"]
            max_price = min_max_doc[0]["max_price"]
            
            # Calculer la largeur des intervalles
            bin_width = (max_price - min_price) / bins if max_price > min_price else 1000
            
            # Initialiser les compteurs pour chaque intervalle
            bin_counts = [0] * bins
            bin_edges = [min_price + i * bin_width for i in range(bins + 1)]
            
            # Compter le nombre d'annonces dans chaque intervalle
            for i in range(bins):
                lower_bound = bin_edges[i]
                upper_bound = bin_edges[i + 1]
                
                count = await db.cars.count_documents({
                    **query,
                    "price": {"$gte": lower_bound, "$lt": upper_bound if i < bins - 1 else upper_bound + 1}
                })
                
                bin_counts[i] = count
            
            # Formater les intervalles pour l'affichage
            bins_formatted = [f"{int(bin_edges[i])}-{int(bin_edges[i+1])}" for i in range(bins)]
            
            return PriceDistribution(
                min_price=min_price,
                max_price=max_price,
                bins=bins_formatted,
                bin_counts=bin_counts
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la distribution des prix: {str(e)}")
            return PriceDistribution(
                min_price=0,
                max_price=0,
                bins=[],
                bin_counts=[]
            )
    
    async def get_price_trends(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        period_days: int = 90
    ) -> PriceTrend:
        """
        Récupère les tendances de prix sur une période
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Calculer la date de début de la période
            start_date = datetime.utcnow() - timedelta(days=period_days)
            
            # Récupérer les prix moyens par jour
            price_trend_cursor = db.cars.aggregate([
                {"$match": {**query, "created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "avg_price": {"$avg": "$price"},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ])
            
            dates = []
            prices = []
            volumes = []
            
            async for doc in price_trend_cursor:
                dates.append(doc["_id"])
                prices.append(round(doc["avg_price"], 2))
                volumes.append(doc["count"])
            
            # Calculer la variation de prix
            price_change = 0
            price_change_percentage = 0
            
            if len(prices) >= 2:
                first_price = prices[0]
                last_price = prices[-1]
                price_change = last_price - first_price
                price_change_percentage = (price_change / first_price) * 100 if first_price > 0 else 0
            
            return PriceTrend(
                dates=dates,
                prices=prices,
                volumes=volumes,
                price_change=round(price_change, 2),
                price_change_percentage=round(price_change_percentage, 2)
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des tendances de prix: {str(e)}")
            return PriceTrend(
                dates=[],
                prices=[],
                volumes=[],
                price_change=0,
                price_change_percentage=0
            )
    
    async def get_popular_brands(
        self,
        db: AsyncIOMotorDatabase,
        limit: int = 10
    ) -> List[PopularBrand]:
        """
        Récupère les marques les plus populaires
        """
        try:
            # Récupérer les marques les plus populaires
            brands_cursor = db.cars.aggregate([
                {"$group": {
                    "_id": "$brand",
                    "count": {"$sum": 1},
                    "avg_price": {"$avg": "$price"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ])
            
            popular_brands = []
            
            async for doc in brands_cursor:
                if doc["_id"]:  # Ignorer les valeurs nulles
                    # Récupérer le nombre de bonnes affaires pour cette marque
                    good_deals_count = await db.cars.count_documents({
                        "brand": doc["_id"],
                        "is_good_deal": True
                    })
                    
                    popular_brands.append(PopularBrand(
                        brand=doc["_id"],
                        count=doc["count"],
                        avg_price=round(doc["avg_price"], 2),
                        good_deals_count=good_deals_count,
                        good_deals_percentage=round((good_deals_count / doc["count"]) * 100, 2) if doc["count"] > 0 else 0
                    ))
            
            return popular_brands
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des marques populaires: {str(e)}")
            return []
    
    async def get_popular_models(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        limit: int = 10
    ) -> List[PopularModel]:
        """
        Récupère les modèles les plus populaires
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            
            # Récupérer les modèles les plus populaires
            models_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {
                    "_id": {"brand": "$brand", "model": "$model"},
                    "count": {"$sum": 1},
                    "avg_price": {"$avg": "$price"},
                    "avg_year": {"$avg": "$year"},
                    "avg_mileage": {"$avg": "$mileage"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ])
            
            popular_models = []
            
            async for doc in models_cursor:
                if doc["_id"]["model"]:  # Ignorer les valeurs nulles
                    # Récupérer le nombre de bonnes affaires pour ce modèle
                    good_deals_count = await db.cars.count_documents({
                        "brand": doc["_id"]["brand"],
                        "model": doc["_id"]["model"],
                        "is_good_deal": True
                    })
                    
                    popular_models.append(PopularModel(
                        brand=doc["_id"]["brand"],
                        model=doc["_id"]["model"],
                        count=doc["count"],
                        avg_price=round(doc["avg_price"], 2),
                        avg_year=round(doc["avg_year"], 2),
                        avg_mileage=round(doc["avg_mileage"], 2),
                        good_deals_count=good_deals_count,
                        good_deals_percentage=round((good_deals_count / doc["count"]) * 100, 2) if doc["count"] > 0 else 0
                    ))
            
            return popular_models
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des modèles populaires: {str(e)}")
            return []
    
    async def get_price_by_age(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None
    ) -> PriceByAge:
        """
        Récupère les prix moyens par âge du véhicule
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Récupérer les prix moyens par année
            price_by_year_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {
                    "_id": "$year",
                    "avg_price": {"$avg": "$price"},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ])
            
            years = []
            prices = []
            counts = []
            
            async for doc in price_by_year_cursor:
                if doc["_id"]:  # Ignorer les valeurs nulles
                    years.append(doc["_id"])
                    prices.append(round(doc["avg_price"], 2))
                    counts.append(doc["count"])
            
            # Calculer la dépréciation annuelle moyenne
            depreciation_rate = 0
            if len(years) >= 2 and len(prices) >= 2:
                # Trier les années et les prix
                sorted_data = sorted(zip(years, prices), key=lambda x: x[0])
                sorted_years = [y for y, _ in sorted_data]
                sorted_prices = [p for _, p in sorted_data]
                
                # Calculer la dépréciation entre la première et la dernière année
                first_year = sorted_years[0]
                last_year = sorted_years[-1]
                first_price = sorted_prices[0]
                last_price = sorted_prices[-1]
                
                year_diff = last_year - first_year
                if year_diff > 0 and first_price > 0:
                    total_depreciation = (first_price - last_price) / first_price
                    depreciation_rate = (total_depreciation / year_diff) * 100
            
            return PriceByAge(
                years=years,
                prices=prices,
                counts=counts,
                depreciation_rate=round(depreciation_rate, 2)
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des prix par âge: {str(e)}")
            return PriceByAge(
                years=[],
                prices=[],
                counts=[],
                depreciation_rate=0
            )
    
    async def get_price_by_mileage(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        bins: int = 10
    ) -> PriceByMileage:
        """
        Récupère les prix moyens par kilométrage
        """
        try:
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Récupérer les kilométrages min et max
            min_max_cursor = db.cars.aggregate([
                {"$match": query},
                {"$group": {
                    "_id": None,
                    "min_mileage": {"$min": "$mileage"},
                    "max_mileage": {"$max": "$mileage"}
                }}
            ])
            min_max_doc = await min_max_cursor.to_list(length=1)
            
            if not min_max_doc:
                return PriceByMileage(
                    mileage_ranges=[],
                    prices=[],
                    counts=[],
                    price_per_km=0
                )
            
            min_mileage = min_max_doc[0]["min_mileage"]
            max_mileage = min_max_doc[0]["max_mileage"]
            
            # Calculer la largeur des intervalles
            bin_width = (max_mileage - min_mileage) / bins if max_mileage > min_mileage else 10000
            
            # Initialiser les tableaux pour les résultats
            mileage_ranges = []
            prices = []
            counts = []
            
            # Calculer les prix moyens pour chaque intervalle de kilométrage
            for i in range(bins):
                lower_bound = min_mileage + i * bin_width
                upper_bound = min_mileage + (i + 1) * bin_width
                
                # Formater l'intervalle pour l'affichage
                mileage_range = f"{int(lower_bound)}-{int(upper_bound)}"
                mileage_ranges.append(mileage_range)
                
                # Récupérer le prix moyen pour cet intervalle
                avg_price_cursor = db.cars.aggregate([
                    {"$match": {
                        **query,
                        "mileage": {"$gte": lower_bound, "$lt": upper_bound if i < bins - 1 else upper_bound + 1}
                    }},
                    {"$group": {
                        "_id": None,
                        "avg_price": {"$avg": "$price"},
                        "count": {"$sum": 1}
                    }}
                ])
                avg_price_doc = await avg_price_cursor.to_list(length=1)
                
                if avg_price_doc:
                    prices.append(round(avg_price_doc[0]["avg_price"], 2))
                    counts.append(avg_price_doc[0]["count"])
                else:
                    prices.append(0)
                    counts.append(0)
            
            # Calculer le prix par kilomètre
            price_per_km = 0
            if len(prices) >= 2 and max_mileage > min_mileage:
                # Trouver les intervalles avec des données
                valid_data = [(m, p) for m, p, c in zip(
                    [(min_mileage + i * bin_width + min_mileage + (i + 1) * bin_width) / 2 for i in range(bins)],
                    prices,
                    counts
                ) if p > 0 and c > 0]
                
                if len(valid_data) >= 2:
                    # Trier par kilométrage
                    valid_data.sort(key=lambda x: x[0])
                    
                    # Calculer la pente de la régression linéaire
                    first_mileage, first_price = valid_data[0]
                    last_mileage, last_price = valid_data[-1]
                    
                    mileage_diff = last_mileage - first_mileage
                    price_diff = first_price - last_price  # Négatif car le prix diminue avec le kilométrage
                    
                    if mileage_diff > 0:
                        price_per_km = price_diff / mileage_diff
            
            return PriceByMileage(
                mileage_ranges=mileage_ranges,
                prices=prices,
                counts=counts,
                price_per_km=round(price_per_km, 4)
            )
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des prix par kilométrage: {str(e)}")
            return PriceByMileage(
                mileage_ranges=[],
                prices=[],
                counts=[],
                price_per_km=0
            )
    
    async def get_market_insights(
        self,
        db: AsyncIOMotorDatabase,
        brand: Optional[str] = None,
        model: Optional[str] = None
    ) -> List[MarketInsight]:
        """
        Récupère des insights sur le marché
        """
        try:
            insights = []
            
            # Construire la requête de base
            query = {}
            if brand:
                query["brand"] = brand
            if model:
                query["model"] = model
            
            # Insight 1: Meilleur moment pour acheter
            # Analyser les tendances de prix sur les 90 derniers jours
            price_trend = await self.get_price_trends(db, brand, model, 90)
            
            if price_trend.price_change < 0:
                insights.append(MarketInsight(
                    title="Tendance des prix à la baisse",
                    description=f"Les prix ont baissé de {abs(price_trend.price_change_percentage):.1f}% au cours des 90 derniers jours. C'est peut-être un bon moment pour acheter.",
                    type="price_trend",
                    value=price_trend.price_change_percentage
                ))
            elif price_trend.price_change > 0:
                insights.append(MarketInsight(
                    title="Tendance des prix à la hausse",
                    description=f"Les prix ont augmenté de {price_trend.price_change_percentage:.1f}% au cours des 90 derniers jours. Il pourrait être judicieux d'attendre une baisse des prix.",
                    type="price_trend",
                    value=price_trend.price_change_percentage
                ))
            
            # Insight 2: Proportion de bonnes affaires
            market_overview = await self.get_market_overview(db, brand, model)
            
            if market_overview.good_deals_percentage > 20:
                insights.append(MarketInsight(
                    title="Nombreuses bonnes affaires",
                    description=f"{market_overview.good_deals_percentage:.1f}% des annonces sont considérées comme de bonnes affaires. C'est un marché favorable aux acheteurs.",
                    type="good_deals",
                    value=market_overview.good_deals_percentage
                ))
            elif market_overview.good_deals_percentage < 5:
                insights.append(MarketInsight(
                    title="Peu de bonnes affaires",
                    description=f"Seulement {market_overview.good_deals_percentage:.1f}% des annonces sont considérées comme de bonnes affaires. Le marché est tendu.",
                    type="good_deals",
                    value=market_overview.good_deals_percentage
                ))
            
            # Insight 3: Offre du marché
            if market_overview.new_listings_percentage > 15:
                insights.append(MarketInsight(
                    title="Offre en augmentation",
                    description=f"{market_overview.new_listings_percentage:.1f}% des annonces ont été publiées au cours des 7 derniers jours. L'offre est en augmentation.",
                    type="market_supply",
                    value=market_overview.new_listings_percentage
                ))
            elif market_overview.new_listings_percentage < 5:
                insights.append(MarketInsight(
                    title="Offre limitée",
                    description=f"Seulement {market_overview.new_listings_percentage:.1f}% des annonces ont été publiées au cours des 7 derniers jours. L'offre est limitée.",
                    type="market_supply",
                    value=market_overview.new_listings_percentage
                ))
            
            # Insight 4: Dépréciation
            price_by_age = await self.get_price_by_age(db, brand, model)
            
            if price_by_age.depreciation_rate > 15:
                insights.append(MarketInsight(
                    title="Dépréciation rapide",
                    description=f"Ces véhicules se déprécient en moyenne de {price_by_age.depreciation_rate:.1f}% par an. Envisagez d'acheter un véhicule de quelques années pour économiser.",
                    type="depreciation",
                    value=price_by_age.depreciation_rate
                ))
            elif price_by_age.depreciation_rate < 5:
                insights.append(MarketInsight(
                    title="Dépréciation lente",
                    description=f"Ces véhicules se déprécient lentement, seulement {price_by_age.depreciation_rate:.1f}% par an. Ils conservent bien leur valeur.",
                    type="depreciation",
                    value=price_by_age.depreciation_rate
                ))
            
            # Insight 5: Prix par kilomètre
            price_by_mileage = await self.get_price_by_mileage(db, brand, model)
            
            if price_by_mileage.price_per_km > 0.1:
                insights.append(MarketInsight(
                    title="Impact important du kilométrage sur le prix",
                    description=f"Chaque kilomètre supplémentaire réduit le prix d'environ {price_by_mileage.price_per_km:.4f}€. Le kilométrage a un impact significatif sur la valeur.",
                    type="mileage_impact",
                    value=price_by_mileage.price_per_km
                ))
            elif price_by_mileage.price_per_km < 0.01:
                insights.append(MarketInsight(
                    title="Faible impact du kilométrage sur le prix",
                    description=f"Le kilométrage a peu d'impact sur le prix, seulement {price_by_mileage.price_per_km:.4f}€ par kilomètre.",
                    type="mileage_impact",
                    value=price_by_mileage.price_per_km
                ))
            
            return insights
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des insights du marché: {str(e)}")
            return [] 