import { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '../../../middleware/auth';

// Temporary user for development
const DEV_USER = {
  _id: '1',
  email: 'dev@example.com',
  password: 'password123'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For development, just check against the dev user
    if (email === DEV_USER.email && password === DEV_USER.password) {
      const token = createToken({ 
        sub: DEV_USER._id,
        email: DEV_USER.email
      });

      return res.status(200).json({
        token,
        user: {
          _id: DEV_USER._id,
          email: DEV_USER.email
        }
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 