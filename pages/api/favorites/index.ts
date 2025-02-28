import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/mongodb';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { db } = await connectToDatabase();
  const userId = new ObjectId(req.user!.userId);

  switch (req.method) {
    case 'GET':
      try {
        const user = await db.collection('users').findOne(
          { _id: userId },
          { projection: { favorites: 1 } }
        );

        if (!user?.favorites?.length) {
          return res.status(200).json({ favorites: [] });
        }

        const favoriteIds = user.favorites.map((id: string) => new ObjectId(id));
        const favorites = await db.collection('cars')
          .find({ _id: { $in: favoriteIds } })
          .toArray();

        return res.status(200).json({ favorites });
      } catch (error) {
        console.error('Error fetching favorites:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { carId } = req.body;

        if (!carId || !ObjectId.isValid(carId)) {
          return res.status(400).json({ message: 'Invalid car ID' });
        }

        // Vérifier si la voiture existe
        const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });
        if (!car) {
          return res.status(404).json({ message: 'Car not found' });
        }

        // Ajouter aux favoris s'il n'y est pas déjà
        await db.collection('users').updateOne(
          { _id: userId },
          { $addToSet: { favorites: carId } }
        );

        return res.status(200).json({ message: 'Car added to favorites' });
      } catch (error) {
        console.error('Error adding to favorites:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const { carId } = req.body;

        if (!carId || !ObjectId.isValid(carId)) {
          return res.status(400).json({ message: 'Invalid car ID' });
        }

        await db.collection('users').updateOne(
          { _id: userId },
          { $pull: { favorites: carId } }
        );

        return res.status(200).json({ message: 'Car removed from favorites' });
      } catch (error) {
        console.error('Error removing from favorites:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); 