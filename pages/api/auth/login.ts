import { NextApiRequest, NextApiResponse } from 'next';
import { compare } from 'bcryptjs';
import { connectToDatabase } from '../../../utils/mongodb';
import jwt from 'jsonwebtoken';
import { User } from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne({ email }) as User | null;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        favorites: user.favorites || [],
        alerts: user.alerts || [],
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 