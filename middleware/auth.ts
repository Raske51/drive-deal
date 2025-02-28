import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Temporary secret for development
const DEV_SECRET = 'temporary-dev-secret-do-not-use-in-production';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, DEV_SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

export const createToken = (userId: string) => {
  return jwt.sign({ sub: userId }, DEV_SECRET, { expiresIn: '24h' });
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

      // Add user to request object
      req.user = {
        id: decoded.sub as string,
        email: decoded.email as string,
      };

      return handler(req, res);
    } catch (error: any) {
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
      id: decoded.sub as string,
      email: decoded.email as string,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}; 