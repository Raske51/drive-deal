import { NextApiResponse } from 'next';
import { executeQuery } from '../../../utils/database';
import { requireAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid car ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const result = await executeQuery(
          `SELECT * FROM cars WHERE id = ?`,
          [id]
        );
        
        const car = result.results?.[0];
        
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
        const updateData = req.body;
        const now = new Date().toISOString();
        
        // Prevent ID modification
        delete updateData.id;
        
        const updateParts = [];
        const params = [];
        
        // Build dynamic update query
        for (const [key, value] of Object.entries(updateData)) {
          updateParts.push(`${key} = ?`);
          params.push(value);
        }
        
        // Add updated_at
        updateParts.push('updated_at = ?');
        params.push(now);
        
        // Add ID to WHERE clause
        params.push(id);
        
        const result = await executeQuery(
          `UPDATE cars SET ${updateParts.join(', ')} WHERE id = ?`,
          params
        );

        if (result.changes === 0) {
          return res.status(404).json({ message: 'Car not found' });
        }
        
        // Get updated car
        const updatedCarResult = await executeQuery(
          `SELECT * FROM cars WHERE id = ?`,
          [id]
        );
        
        return res.status(200).json({
          message: 'Car updated successfully',
          car: updatedCarResult.results?.[0]
        });
      } catch (error) {
        console.error('Error updating car:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const result = await executeQuery(
          `DELETE FROM cars WHERE id = ?`,
          [id]
        );

        if (result.changes === 0) {
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

export default requireAuth(handler); 