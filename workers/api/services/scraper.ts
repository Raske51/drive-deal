import { Env } from '../types';

// Types pour les annonces
export interface CarListing {
  title: string;
  price: number;
  location: string;
  year?: number;
  mileage?: number;
  brand?: string;
  model?: string;
  fuel_type?: string;
  transmission?: string;
  image_url?: string;
  source_url: string;
  source: string;
  listing_id: string;
  scraped_at: string;
}

// Liste d'User-Agents variés
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
];

// Fonction pour générer un User-Agent aléatoire
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Fonction pour ajouter un délai aléatoire
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Fonction pour générer un identifiant unique pour la recherche (pour le cache)
function generateCacheKey(params: Record<string, string>): string {
  return Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

// Fonction pour extraire les annonces de LeBonCoin
export async function scrapeLeBonCoin(
  params: { brand?: string; model?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string },
  env: Env
): Promise<{ listings: CarListing[]; cacheHit: boolean }> {
  // Générer la clé de cache
  const cacheKey = `scrape:leboncoin:${generateCacheKey(params)}`;
  
  // Vérifier si les résultats sont en cache
  const cachedData = await env.SESSIONS.get(cacheKey);
  if (cachedData) {
    return { listings: JSON.parse(cachedData), cacheHit: true };
  }
  
  // Construire l'URL de recherche
  let url = 'https://www.leboncoin.fr/recherche?category=2&locations=France';
  
  if (params.brand) {
    url += `&brand=${encodeURIComponent(params.brand)}`;
  }
  
  if (params.model) {
    url += `&model=${encodeURIComponent(params.model)}`;
  }
  
  if (params.minPrice) {
    url += `&price=${encodeURIComponent(params.minPrice)}`;
  }
  
  if (params.maxPrice) {
    url += `-${encodeURIComponent(params.maxPrice)}`;
  }
  
  if (params.minYear) {
    url += `&regdate=${encodeURIComponent(params.minYear)}`;
  }
  
  if (params.maxYear) {
    url += `-${encodeURIComponent(params.maxYear)}`;
  }
  
  // Simuler une requête avec fetch (version simplifiée pour Cloudflare Workers)
  const userAgent = getRandomUserAgent();
  
  try {
    // Ajouter un délai aléatoire pour éviter la détection
    await randomDelay(1000, 3000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extraction des données (version simplifiée)
    // Dans un environnement réel, nous utiliserions un parser HTML comme cheerio
    // Mais pour Cloudflare Workers, nous utilisons une approche simplifiée avec des regex
    
    // Simulons des résultats pour l'exemple
    // Dans une implémentation réelle, nous extrairions les données du HTML
    const listings: CarListing[] = [];
    
    // Extraction simplifiée avec regex (à adapter selon la structure réelle du site)
    const listingRegex = /<div[^>]*class="[^"]*aditem[^"]*"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
    const titleRegex = /<h2[^>]*class="[^"]*aditem_title[^"]*"[^>]*>([\s\S]*?)<\/h2>/;
    const priceRegex = /<span[^>]*class="[^"]*aditem_price[^"]*"[^>]*>([\s\S]*?)<\/span>/;
    const locationRegex = /<p[^>]*class="[^"]*aditem_location[^"]*"[^>]*>([\s\S]*?)<\/p>/;
    const imageRegex = /<img[^>]*src="([^"]+)"[^>]*>/;
    
    let match;
    while ((match = listingRegex.exec(html)) !== null) {
      const listingId = match[1];
      const listingHtml = match[2];
      
      const titleMatch = titleRegex.exec(listingHtml);
      const priceMatch = priceRegex.exec(listingHtml);
      const locationMatch = locationRegex.exec(listingHtml);
      const imageMatch = imageRegex.exec(listingHtml);
      
      if (titleMatch && priceMatch) {
        const title = titleMatch[1].trim();
        const priceText = priceMatch[1].trim().replace(/\s+/g, '').replace('€', '');
        const price = parseInt(priceText, 10);
        const location = locationMatch ? locationMatch[1].trim() : '';
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        // Extraction des informations supplémentaires du titre
        const brandModelRegex = /^([\w\s]+)\s+([\w\s\d]+)/;
        const brandModelMatch = brandModelRegex.exec(title);
        
        const yearRegex = /\b(20\d{2}|19\d{2})\b/;
        const yearMatch = yearRegex.exec(title);
        
        const mileageRegex = /\b(\d+(?:\s?\d+)*)\s*km\b/i;
        const mileageMatch = mileageRegex.exec(title);
        
        const fuelTypes = ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL'];
        const fuelRegex = new RegExp(`\\b(${fuelTypes.join('|')})\\b`, 'i');
        const fuelMatch = fuelRegex.exec(title);
        
        const transmissions = ['Manuelle', 'Automatique'];
        const transmissionRegex = new RegExp(`\\b(${transmissions.join('|')})\\b`, 'i');
        const transmissionMatch = transmissionRegex.exec(title);
        
        listings.push({
          title,
          price,
          location,
          year: yearMatch ? parseInt(yearMatch[1], 10) : undefined,
          mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/\s/g, ''), 10) : undefined,
          brand: brandModelMatch ? brandModelMatch[1].trim() : undefined,
          model: brandModelMatch ? brandModelMatch[2].trim() : undefined,
          fuel_type: fuelMatch ? fuelMatch[1] : undefined,
          transmission: transmissionMatch ? transmissionMatch[1] : undefined,
          image_url: imageUrl,
          source_url: `https://www.leboncoin.fr/voitures/${listingId}.htm`,
          source: 'leboncoin',
          listing_id: listingId,
          scraped_at: new Date().toISOString()
        });
      }
    }
    
    // Stocker les résultats en cache (12 heures)
    await env.SESSIONS.put(cacheKey, JSON.stringify(listings), { expirationTtl: 43200 });
    
    return { listings, cacheHit: false };
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    return { listings: [], cacheHit: false };
  }
}

// Fonction pour extraire les annonces de La Centrale
export async function scrapeLaCentrale(
  params: { brand?: string; model?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string },
  env: Env
): Promise<{ listings: CarListing[]; cacheHit: boolean }> {
  // Générer la clé de cache
  const cacheKey = `scrape:lacentrale:${generateCacheKey(params)}`;
  
  // Vérifier si les résultats sont en cache
  const cachedData = await env.SESSIONS.get(cacheKey);
  if (cachedData) {
    return { listings: JSON.parse(cachedData), cacheHit: true };
  }
  
  // Construire l'URL de recherche
  let url = 'https://www.lacentrale.fr/listing?';
  
  if (params.brand) {
    url += `makesModelsCommercialNames=${encodeURIComponent(params.brand)}`;
    
    if (params.model) {
      url += `%3A${encodeURIComponent(params.model)}`;
    }
    
    url += '&';
  }
  
  if (params.minPrice) {
    url += `priceMin=${encodeURIComponent(params.minPrice)}&`;
  }
  
  if (params.maxPrice) {
    url += `priceMax=${encodeURIComponent(params.maxPrice)}&`;
  }
  
  if (params.minYear) {
    url += `yearMin=${encodeURIComponent(params.minYear)}&`;
  }
  
  if (params.maxYear) {
    url += `yearMax=${encodeURIComponent(params.maxYear)}&`;
  }
  
  // Simuler une requête avec fetch
  const userAgent = getRandomUserAgent();
  
  try {
    // Ajouter un délai aléatoire pour éviter la détection
    await randomDelay(1000, 3000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extraction des données (version simplifiée)
    const listings: CarListing[] = [];
    
    // Extraction simplifiée avec regex (à adapter selon la structure réelle du site)
    const listingRegex = /<div[^>]*class="[^"]*searchCard[^"]*"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
    const titleRegex = /<h3[^>]*class="[^"]*searchCard__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/;
    const priceRegex = /<span[^>]*class="[^"]*searchCard__price[^"]*"[^>]*>([\s\S]*?)<\/span>/;
    const locationRegex = /<div[^>]*class="[^"]*searchCard__location[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const imageRegex = /<img[^>]*data-src="([^"]+)"[^>]*>/;
    const yearRegex = /<div[^>]*class="[^"]*searchCard__year[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const mileageRegex = /<div[^>]*class="[^"]*searchCard__mileage[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const fuelRegex = /<div[^>]*class="[^"]*searchCard__energy[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const transmissionRegex = /<div[^>]*class="[^"]*searchCard__gearbox[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    
    let match;
    while ((match = listingRegex.exec(html)) !== null) {
      const listingId = match[1];
      const listingHtml = match[2];
      
      const titleMatch = titleRegex.exec(listingHtml);
      const priceMatch = priceRegex.exec(listingHtml);
      const locationMatch = locationRegex.exec(listingHtml);
      const imageMatch = imageRegex.exec(listingHtml);
      const yearMatch = yearRegex.exec(listingHtml);
      const mileageMatch = mileageRegex.exec(listingHtml);
      const fuelMatch = fuelRegex.exec(listingHtml);
      const transmissionMatch = transmissionRegex.exec(listingHtml);
      
      if (titleMatch && priceMatch) {
        const title = titleMatch[1].trim();
        const priceText = priceMatch[1].trim().replace(/\s+/g, '').replace('€', '');
        const price = parseInt(priceText, 10);
        const location = locationMatch ? locationMatch[1].trim() : '';
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        // Extraction des informations supplémentaires du titre
        const brandModelRegex = /^([\w\s]+)\s+([\w\s\d]+)/;
        const brandModelMatch = brandModelRegex.exec(title);
        
        listings.push({
          title,
          price,
          location,
          year: yearMatch ? parseInt(yearMatch[1].trim(), 10) : undefined,
          mileage: mileageMatch ? parseInt(mileageMatch[1].trim().replace(/\s/g, '').replace('km', ''), 10) : undefined,
          brand: brandModelMatch ? brandModelMatch[1].trim() : undefined,
          model: brandModelMatch ? brandModelMatch[2].trim() : undefined,
          fuel_type: fuelMatch ? fuelMatch[1].trim() : undefined,
          transmission: transmissionMatch ? transmissionMatch[1].trim() : undefined,
          image_url: imageUrl,
          source_url: `https://www.lacentrale.fr/auto-occasion-annonce-${listingId}.html`,
          source: 'lacentrale',
          listing_id: listingId,
          scraped_at: new Date().toISOString()
        });
      }
    }
    
    // Stocker les résultats en cache (12 heures)
    await env.SESSIONS.put(cacheKey, JSON.stringify(listings), { expirationTtl: 43200 });
    
    return { listings, cacheHit: false };
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    return { listings: [], cacheHit: false };
  }
}

// Fonction principale pour scraper plusieurs sources
export async function scrapeCarListings(
  params: { brand?: string; model?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string; sources?: string[] },
  env: Env
): Promise<{ listings: CarListing[]; sources: { [key: string]: { count: number; cacheHit: boolean } } }> {
  const sources = params.sources || ['leboncoin', 'lacentrale'];
  const results: { [key: string]: { listings: CarListing[]; cacheHit: boolean } } = {};
  
  // Scraper chaque source en parallèle
  await Promise.all(sources.map(async (source) => {
    switch (source) {
      case 'leboncoin':
        results.leboncoin = await scrapeLeBonCoin(params, env);
        break;
      case 'lacentrale':
        results.lacentrale = await scrapeLaCentrale(params, env);
        break;
      default:
        break;
    }
  }));
  
  // Fusionner les résultats
  const allListings: CarListing[] = [];
  const sourcesStats: { [key: string]: { count: number; cacheHit: boolean } } = {};
  
  Object.entries(results).forEach(([source, result]) => {
    allListings.push(...result.listings);
    sourcesStats[source] = {
      count: result.listings.length,
      cacheHit: result.cacheHit
    };
  });
  
  return {
    listings: allListings,
    sources: sourcesStats
  };
} 