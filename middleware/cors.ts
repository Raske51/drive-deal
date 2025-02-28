import cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { security } from '../config/security';

// Initialize CORS options
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = security.cors.origin.split(',');
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: security.cors.methods,
  allowedHeaders: security.cors.allowedHeaders,
  exposedHeaders: security.cors.exposedHeaders,
  credentials: security.cors.credentials,
  maxAge: security.cors.maxAge,
  optionsSuccessStatus: 204,
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Wrapper for Next.js API routes
export const withCors = (handler: any) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(handler(req, res));
    });
  });
}; 