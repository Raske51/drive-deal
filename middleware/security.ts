import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';

// Type adapter pour compatibilité avec Express
type NextApiRequestWithExpress = NextApiRequest & {
  get: (name: string) => string;
  header: (name: string) => string;
  accepts: (...types: string[]) => string | false;
  acceptsCharsets: (...charsets: string[]) => string | false;
};

// Rate limiting configuration
export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req as any) || 'unknown',
});

// Security headers middleware
export const securityHeaders = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  // Adapter les types pour Express
  const expressReq = req as unknown as NextApiRequestWithExpress;
  
  // Use Helmet for security headers
  helmet()(expressReq as any, res as any, () => {});

  // Prevent XSS attacks
  xss()(expressReq as any, res as any, () => {});

  // Prevent HTTP Parameter Pollution
  hpp()(expressReq as any, res as any, () => {});

  // Set additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;"
  );

  next();
};

// Detect suspicious activity
export const detectSuspiciousActivity = (req: NextApiRequest) => {
  const suspiciousPatterns = [
    /union\s+select/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /<script>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
  ];

  const requestData = {
    body: JSON.stringify(req.body),
    query: JSON.stringify(req.query),
    headers: JSON.stringify(req.headers),
  };

  return Object.values(requestData).some((value) =>
    suspiciousPatterns.some((pattern) => pattern.test(value))
  );
};

// Middleware to check for suspicious activity
export const suspiciousActivityCheck = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  if (detectSuspiciousActivity(req)) {
    console.error('Suspicious activity detected:', {
      ip: getClientIp(req as any),
      path: req.url,
      method: req.method,
    });
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Apply all security middleware
export const applySecurityMiddleware = (handler: any) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      limiter(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        securityHeaders(req, res, () => {
          suspiciousActivityCheck(req, res, () => {
            return resolve(handler(req, res));
          });
        });
      });
    });
  };
}; 