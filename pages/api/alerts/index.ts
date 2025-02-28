import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/mongodb';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { User } from '../../../models/User';

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
          { projection: { alerts: 1 } }
        );

        return res.status(200).json({ alerts: user?.alerts || [] });
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { criteria, frequency = 'daily' } = req.body;

        if (!criteria || Object.keys(criteria).length === 0) {
          return res.status(400).json({ message: 'Alert criteria are required' });
        }

        if (!['daily', 'weekly'].includes(frequency)) {
          return res.status(400).json({ message: 'Invalid frequency' });
        }

        const alert = {
          id: new ObjectId().toString(),
          criteria,
          frequency,
          active: true,
          createdAt: new Date()
        };

        await db.collection('users').updateOne(
          { _id: userId },
          { 
            $push: { alerts: alert },
            $set: { updatedAt: new Date() }
          }
        );

        return res.status(201).json({
          message: 'Alert created successfully',
          alert
        });
      } catch (error) {
        console.error('Error creating alert:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const { alertId } = req.query;
        const { criteria, frequency, active } = req.body;

        if (!alertId) {
          return res.status(400).json({ message: 'Alert ID is required' });
        }

        const updateData: any = {};
        if (criteria) updateData['alerts.$.criteria'] = criteria;
        if (frequency) {
          if (!['daily', 'weekly'].includes(frequency)) {
            return res.status(400).json({ message: 'Invalid frequency' });
          }
          updateData['alerts.$.frequency'] = frequency;
        }
        if (typeof active === 'boolean') updateData['alerts.$.active'] = active;

        const result = await db.collection('users').updateOne(
          { 
            _id: userId,
            'alerts.id': alertId
          },
          { 
            $set: {
              ...updateData,
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Alert not found' });
        }

        return res.status(200).json({ message: 'Alert updated successfully' });
      } catch (error) {
        console.error('Error updating alert:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const { alertId } = req.query;

        if (!alertId) {
          return res.status(400).json({ message: 'Alert ID is required' });
        }

        const result = await db.collection('users').updateOne(
          { _id: userId },
          { 
            $pull: { alerts: { id: alertId } },
            $set: { updatedAt: new Date() }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Alert not found' });
        }

        return res.status(200).json({ message: 'Alert deleted successfully' });
      } catch (error) {
        console.error('Error deleting alert:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); 