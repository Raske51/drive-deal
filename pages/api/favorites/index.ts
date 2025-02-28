import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../middleware/auth';
import { getUserFavorites, addToFavorites, removeFromFavorites } from '../../../utils/store';

async function handler(req: NextApiRequest & { user?: { id: string } }, res: NextApiResponse) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const favorites = getUserFavorites(userId);
        return res.status(200).json(favorites);
      } catch (error: any) {
        console.error('Error fetching favorites:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'POST':
      try {
        const { carId } = req.body;
        if (!carId) {
          return res.status(400).json({ error: 'Car ID is required' });
        }

        addToFavorites(userId, carId);
        return res.status(200).json({ message: 'Car added to favorites' });
      } catch (error: any) {
        console.error('Error adding to favorites:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'DELETE':
      try {
        const { carId } = req.body;
        if (!carId) {
          return res.status(400).json({ error: 'Car ID is required' });
        }

        removeFromFavorites(userId, carId);
        return res.status(200).json({ message: 'Car removed from favorites' });
      } catch (error: any) {
        console.error('Error removing from favorites:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

export default requireAuth(handler); 