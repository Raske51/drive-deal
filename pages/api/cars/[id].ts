import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/mongodb';
import { Car } from '../../../models/Car';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid car ID' });
  }

  const { db } = await connectToDatabase();
  const carId = new ObjectId(id as string);

  switch (req.method) {
    case 'GET':
      try {
        const car = await db.collection('cars').findOne({ _id: carId });
        
        if (!car) {
          return res.status(404).json({ message: 'Car not found' });
        }

        return res.status(200).json(car);
      } catch (error) {
        console.error('Error fetching car:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const updateData: Partial<Car> = {
          ...req.body,
          updatedAt: new Date()
        };

        delete updateData._id; // Empêcher la modification de l'ID

        const result = await db.collection('cars').findOneAndUpdate(
          { _id: carId },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({ message: 'Car not found' });
        }

        return res.status(200).json({
          message: 'Car updated successfully',
          car: result.value
        });
      } catch (error) {
        console.error('Error updating car:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const result = await db.collection('cars').deleteOne({ _id: carId });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Car not found' });
        }

        return res.status(200).json({ message: 'Car deleted successfully' });
      } catch (error) {
        console.error('Error deleting car:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); 