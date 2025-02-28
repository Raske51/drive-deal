import { cleanEnv, str, num, bool, url, email } from 'envalid';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate and transform environment variables
export const env = cleanEnv(process.env, {
  // Authentication
  JWT_SECRET: str({ length: { min: 32 } }),
  JWT_REFRESH_SECRET: str({ length: { min: 32 } }),
  PASSWORD_PEPPER: str({ length: { min: 32 } }),
  SESSION_SECRET: str({ length: { min: 32 } }),

  // Database
  MONGODB_URI: url(),
  MONGODB_USER: str(),
  MONGODB_PASSWORD: str(),

  // AWS S3
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_REGION: str(),
  AWS_BUCKET_NAME: str(),

  // Stripe
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),
  STRIPE_PRICE_ID: str(),

  // Email
  SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_USER: str(),
  SMTP_PASSWORD: str(),
  EMAIL_FROM: email(),

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: str(),
  RECAPTCHA_SECRET_KEY: str(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: num({ default: 60000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),

  // Security
  CORS_ORIGIN: str(),
  ENCRYPTION_KEY: str({ length: { min: 32 } }),
  ALLOWED_FILE_TYPES: str(),
  MAX_FILE_SIZE: num({ default: 5242880 }), // 5MB

  // Monitoring
  SENTRY_DSN: str({ default: '' }),
  LOGTAIL_SOURCE_TOKEN: str({ default: '' }),

  // Feature Flags
  ENABLE_2FA: bool({ default: true }),
  ENABLE_FILE_ENCRYPTION: bool({ default: true }),
  ENABLE_EMAIL_VERIFICATION: bool({ default: true }),
  ENABLE_PASSWORD_HISTORY: bool({ default: true }),
  MAX_PASSWORD_HISTORY: num({ default: 5 }),
  PASSWORD_EXPIRY_DAYS: num({ default: 90 }),

  // Cache
  REDIS_URL: url({ default: 'redis://localhost:6379' }),
  CACHE_TTL: num({ default: 3600 }),
});

// Security constants
export const security = {
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: env.PASSWORD_EXPIRY_DAYS,
    maxHistory: env.MAX_PASSWORD_HISTORY,
  },

  // Session configuration
  session: {
    name: 'sid',
    secret: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // CORS configuration
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600, // 10 minutes
  },

  // Rate limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // File upload
  fileUpload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },

  // JWT configuration
  jwt: {
    accessToken: {
      secret: env.JWT_SECRET,
      expiresIn: '15m',
    },
    refreshToken: {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    },
  },

  // Encryption
  encryption: {
    key: env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
    enabled: env.ENABLE_FILE_ENCRYPTION,
  },

  // 2FA
  twoFactor: {
    enabled: env.ENABLE_2FA,
    issuer: 'DriveDeal',
    window: 1, // Time window in minutes
  },
};

// Validate security configuration
const validateSecurityConfig = () => {
  // Ensure all required environment variables are set
  if (!env.JWT_SECRET || !env.JWT_REFRESH_SECRET || !env.PASSWORD_PEPPER) {
    throw new Error('Missing required security environment variables');
  }

  // Validate password requirements
  if (security.password.minLength < 8) {
    throw new Error('Minimum password length must be at least 8 characters');
  }

  // Validate file upload limits
  if (security.fileUpload.maxSize > 10 * 1024 * 1024) { // 10MB
    throw new Error('Maximum file size cannot exceed 10MB');
  }

  // Validate rate limiting
  if (security.rateLimit.max > 1000) {
    throw new Error('Rate limit maximum requests cannot exceed 1000');
  }
};

// Run validation
validateSecurityConfig();

export default security; 