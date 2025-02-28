#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Module d'optimisation des performances pour les scrapers
Fournit des outils pour améliorer les performances des scrapers
"""

import time
import logging
import threading
import concurrent.futures
from functools import wraps
from typing import List, Dict, Any, Callable, Optional

logger = logging.getLogger("CarScraper.Performance")

def measure_time(func):
    """Décorateur pour mesurer le temps d'exécution d'une fonction"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"Fonction {func.__name__} exécutée en {execution_time:.2f} secondes")
        return result
    return wrapper

def retry(max_retries=3, delay=1, backoff=2, exceptions=(Exception,)):
    """
    Décorateur pour réessayer une fonction en cas d'échec
    
    Args:
        max_retries: Nombre maximum de tentatives
        delay: Délai initial entre les tentatives (en secondes)
        backoff: Facteur multiplicatif pour augmenter le délai entre les tentatives
        exceptions: Tuple d'exceptions à intercepter
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            mtries, mdelay = max_retries, delay
            while mtries > 0:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    mtries -= 1
                    if mtries == 0:
                        raise
                    
                    logger.warning(f"Tentative échouée ({max_retries - mtries}/{max_retries}), nouvelle tentative dans {mdelay} secondes... Erreur: {str(e)}")
                    time.sleep(mdelay)
                    mdelay *= backoff
            return func(*args, **kwargs)
        return wrapper
    return decorator

def parallel_process(items: List[Any], process_func: Callable, max_workers: Optional[int] = None, 
                    chunk_size: int = 1) -> List[Any]:
    """
    Traite une liste d'éléments en parallèle
    
    Args:
        items: Liste d'éléments à traiter
        process_func: Fonction de traitement à appliquer à chaque élément
        max_workers: Nombre maximum de workers (None = nombre de processeurs)
        chunk_size: Taille des chunks pour le traitement par lots
        
    Returns:
        Liste des résultats
    """
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_item = {
            executor.submit(process_func, item): item
            for item in items
        }
        
        for future in concurrent.futures.as_completed(future_to_item):
            item = future_to_item[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                logger.error(f"Exception lors du traitement de {item}: {str(e)}")
    
    return results

class RateLimiter:
    """
    Limiteur de débit pour les requêtes
    Permet de limiter le nombre de requêtes par seconde
    """
    
    def __init__(self, max_per_second: float):
        """
        Initialise le limiteur de débit
        
        Args:
            max_per_second: Nombre maximum de requêtes par seconde
        """
        self.min_interval = 1.0 / max_per_second
        self.last_request_time = 0
        self.lock = threading.Lock()
    
    def wait(self):
        """Attend le temps nécessaire pour respecter la limite de débit"""
        with self.lock:
            current_time = time.time()
            elapsed = current_time - self.last_request_time
            
            if elapsed < self.min_interval:
                sleep_time = self.min_interval - elapsed
                time.sleep(sleep_time)
            
            self.last_request_time = time.time()

class PerformanceMonitor:
    """
    Moniteur de performances pour les scrapers
    Permet de suivre les performances des scrapers et d'identifier les goulots d'étranglement
    """
    
    def __init__(self):
        """Initialise le moniteur de performances"""
        self.metrics = {}
        self.start_times = {}
    
    def start_timer(self, name: str):
        """Démarre un timer pour une métrique donnée"""
        self.start_times[name] = time.time()
    
    def stop_timer(self, name: str):
        """Arrête un timer et enregistre la durée"""
        if name in self.start_times:
            duration = time.time() - self.start_times[name]
            
            if name not in self.metrics:
                self.metrics[name] = {
                    "count": 0,
                    "total_time": 0,
                    "min_time": float("inf"),
                    "max_time": 0
                }
            
            self.metrics[name]["count"] += 1
            self.metrics[name]["total_time"] += duration
            self.metrics[name]["min_time"] = min(self.metrics[name]["min_time"], duration)
            self.metrics[name]["max_time"] = max(self.metrics[name]["max_time"], duration)
            
            del self.start_times[name]
    
    def get_report(self) -> Dict[str, Dict[str, float]]:
        """Génère un rapport de performances"""
        report = {}
        
        for name, data in self.metrics.items():
            avg_time = data["total_time"] / data["count"] if data["count"] > 0 else 0
            
            report[name] = {
                "count": data["count"],
                "total_time": data["total_time"],
                "avg_time": avg_time,
                "min_time": data["min_time"] if data["min_time"] != float("inf") else 0,
                "max_time": data["max_time"]
            }
        
        return report
    
    def print_report(self):
        """Affiche un rapport de performances"""
        report = self.get_report()
        
        print("\n" + "=" * 80)
        print("RAPPORT DE PERFORMANCES")
        print("=" * 80)
        print(f"{'Métrique':<30} | {'Nombre':<10} | {'Temps total':<15} | {'Temps moyen':<15} | {'Temps min':<15} | {'Temps max':<15}")
        print("-" * 80)
        
        for name, data in sorted(report.items(), key=lambda x: x[1]["total_time"], reverse=True):
            print(f"{name:<30} | {data['count']:<10} | {data['total_time']:.2f}s{' ' * (14 - len(f'{data['total_time']:.2f}s'))} | {data['avg_time']:.2f}s{' ' * (14 - len(f'{data['avg_time']:.2f}s'))} | {data['min_time']:.2f}s{' ' * (14 - len(f'{data['min_time']:.2f}s'))} | {data['max_time']:.2f}s")
        
        print("=" * 80)
    
    def reset(self):
        """Réinitialise les métriques"""
        self.metrics = {}
        self.start_times = {} 