import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../utils/mongodb';
import { ObjectId } from 'mongodb';

interface DecodedToken {
  userId: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
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

export const verifyToken = (token: string, type: 'access' | 'refresh'): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      type === 'access' ? process.env.JWT_SECRET! : process.env.JWT_REFRESH_SECRET!,
      (err: any, decoded: any) => {
        if (err) return reject(err);
        if (decoded.type !== type) return reject(new Error('Invalid token type'));
        resolve(decoded as DecodedToken);
      }
    );
  });
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = await verifyToken(refreshToken, 'refresh');
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const requireAuth = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = await verifyToken(token, 'access');

      // Verify user exists in database
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({
        _id: new ObjectId(decoded.userId)
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Add user to request object
      (req as any).user = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      return handler(req, res);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export const requireAdmin = (handler: any) => {
  return requireAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  });
};

export const validateSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const session = await db.collection('sessions').findOne({
    userId: (req as any).user._id,
    token: req.headers.authorization?.split(' ')[1],
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new Error('Invalid session');
  }
}; 