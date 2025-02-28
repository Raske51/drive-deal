export const security = {
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Session configuration
  session: {
    name: 'sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // CORS configuration
  cors: {
    origin: '*', // Allow all origins for now
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600, // 10 minutes
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100, // 100 requests per minute
  },

  // File upload
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },

  // JWT configuration
  jwt: {
    accessToken: {
      expiresIn: '1h',
    },
    refreshToken: {
      expiresIn: '7d',
    },
  },

  // Encryption
  encryption: {
    enabled: false, // Disabled for simple deployment
  },

  // 2FA
  twoFactor: {
    enabled: false, // Disabled for simple deployment
    issuer: 'DriveDeal',
    window: 1, // Time window in minutes
  },
}; 