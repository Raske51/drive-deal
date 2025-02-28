import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail } from '../../../utils/store';
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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user.id);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 