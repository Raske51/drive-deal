declare module 'express-rate-limit' {
  import { RequestHandler, Request } from 'express';

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: any;
    statusCode?: number;
    headers?: boolean;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
    handler?: (req: Request, res: any, next: () => void) => void;
  }

  function rateLimit(options?: RateLimitOptions): RequestHandler;
  
  export default rateLimit;
} 