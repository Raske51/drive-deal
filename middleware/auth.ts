import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../utils/mongodb';
import { ObjectId } from 'mongodb';

// Temporary secret for development
const DEV_SECRET = 'temporary-dev-secret-do-not-use-in-production';

interface DecodedToken {
  userId: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    _id: string;
    email: string;
  };
}

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access') => {
  try {
    return jwt.verify(token, DEV_SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

export const createToken = (payload: object, type: 'access' | 'refresh' = 'access') => {
  const expiresIn = type === 'access' ? '1h' : '7d';
  return jwt.sign(payload, DEV_SECRET, { expiresIn });
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = await verifyToken(refreshToken, 'refresh');
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.sub as string);
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const requireAuth = (handler: any) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      // Verify user exists in database
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({
        _id: new ObjectId(decoded.sub as string)
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Add user to request object
      req.user = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      };

      return handler(req, res);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: error.message });
    }
  };
};

export const requireAdmin = (handler: any) => {
  return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  });
};

export const validateSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const session = await db.collection('sessions').findOne({
    userId: req.user._id,
    token: req.headers.authorization?.split(' ')[1],
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new Error('Invalid session');
  }
};

export const auth = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    req.user = {
      _id: decoded.sub as string,
      email: decoded.email as string,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}; 