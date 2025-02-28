import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../../../utils/database';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const userId = req.user!.id;

  switch (req.method) {
    case 'GET':
      try {
        const alerts = await executeQuery(
          `SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC`,
          [userId]
        );

        return res.status(200).json({ alerts: alerts || [] });
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

        const alertId = uuidv4();
        const now = new Date().toISOString();
        
        await executeQuery(
          `INSERT INTO alerts (id, user_id, criteria, frequency, active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [alertId, userId, JSON.stringify(criteria), frequency, 1, now, now]
        );

        const alert = {
          id: alertId,
          criteria,
          frequency,
          active: true,
          createdAt: now
        };

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

        const updateParts = [];
        const params = [];
        
        if (criteria) {
          updateParts.push('criteria = ?');
          params.push(JSON.stringify(criteria));
        }
        
        if (frequency) {
          if (!['daily', 'weekly'].includes(frequency)) {
            return res.status(400).json({ message: 'Invalid frequency' });
          }
          updateParts.push('frequency = ?');
          params.push(frequency);
        }
        
        if (typeof active === 'boolean') {
          updateParts.push('active = ?');
          params.push(active ? 1 : 0);
        }
        
        updateParts.push('updated_at = ?');
        params.push(new Date().toISOString());
        
        // Add alertId and userId to params
        params.push(alertId);
        params.push(userId);

        const result = await executeQuery(
          `UPDATE alerts SET ${updateParts.join(', ')} 
           WHERE id = ? AND user_id = ?`,
          params
        );

        if (result.changes === 0) {
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

        const result = await executeQuery(
          `DELETE FROM alerts WHERE id = ? AND user_id = ?`,
          [alertId, userId]
        );

        if (result.changes === 0) {
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

export default requireAuth(handler); 