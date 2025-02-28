/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Active la compression Gzip/Brotli
  images: {
    unoptimized: true, // Required for Cloudflare Pages
    formats: ['image/avif', 'image/webp'], // Formats optimisés
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
    domains: ['drive-deal.s3.amazonaws.com', 'images.unsplash.com']
  },
  // Configure for Cloudflare Pages
  output: 'export',
  distDir: 'dist',
  // Disable unnecessary features for Cloudflare Pages
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Optimisation pour la production
  compiler: {
    // Supprime les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Static page generation configuration
  env: {
    API_URL: process.env.NODE_ENV === 'production'
      ? 'https://drive-deal-api.anthonydu51170.workers.dev'
      : 'http://127.0.0.1:8787'
  },
  poweredByHeader: false,
  trailingSlash: true,
  swcMinify: true, // Utilise SWC pour la minification (plus rapide que Terser)
}

module.exports = nextConfig;
