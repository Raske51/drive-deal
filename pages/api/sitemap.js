/**
 * API Route pour générer un sitemap XML
 * 
 * Cette route génère dynamiquement un sitemap XML pour améliorer l'indexation par les moteurs de recherche.
 * Le sitemap inclut toutes les pages importantes du site avec leur priorité et fréquence de mise à jour.
 */

export default function handler(req, res) {
  // Définir l'URL de base du site
  const baseUrl = 'https://drive-deal.pages.dev';
  
  // Obtenir la date actuelle au format ISO pour lastmod
  const date = new Date().toISOString();
  
  // Définir les pages statiques du site
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/listings', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/login', priority: '0.6', changefreq: 'monthly' },
    { url: '/register', priority: '0.6', changefreq: 'monthly' },
    { url: '/sell', priority: '0.8', changefreq: 'weekly' },
    { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  ];
  
  // Générer le contenu XML du sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}
</urlset>`;
  
  // Définir les en-têtes de la réponse
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  
  // Envoyer le sitemap
  res.write(sitemap);
  res.end();
} 