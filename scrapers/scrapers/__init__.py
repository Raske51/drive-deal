#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Package pour les scrapers de véhicules d'occasion.
Contient les différents scrapers spécifiques à chaque site.
"""

from scrapers.scrapers.base_scraper import BaseScraper
from scrapers.scrapers.lacentrale import LaCentraleScraper
from scrapers.scrapers.leparking import LeParkingScraper
from scrapers.scrapers.autoscout24 import AutoScout24Scraper

__all__ = [
    'BaseScraper',
    'LaCentraleScraper',
    'LeParkingScraper',
    'AutoScout24Scraper'
] 