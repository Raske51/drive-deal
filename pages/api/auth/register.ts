import { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '../../../middleware/auth';

// Temporary user storage for development
let users = [
  {
    _id: '1',
    email: 'dev@example.com',
    password: 'password123'
  }
];

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

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = {
      _id: (users.length + 1).toString(),
      email,
      password
    };

    // Store user
    users.push(newUser);

    // Generate token
    const token = createToken({
      sub: newUser._id,
      email: newUser.email
    });

    return res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 