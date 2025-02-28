import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'temporary-dev-secret-do-not-use-in-production';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

export const createToken = (userId: string) => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '24h' });
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