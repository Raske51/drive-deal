import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';

// Rate limiting configuration
export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req) || 'unknown',
});

// Security headers middleware
export const securityHeaders = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  // Use Helmet for security headers
  helmet()(req, res, () => {});

  // Prevent XSS attacks
  xss()(req, res, () => {});

  // Prevent HTTP Parameter Pollution
  hpp()(req, res, () => {});

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
      ip: getClientIp(req),
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
      limiter(req, res, (err: any) => {
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