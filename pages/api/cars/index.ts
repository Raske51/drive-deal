import { NextApiRequest, NextApiResponse } from 'next';
import { findCars } from '../../../utils/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      make, model, 
      minPrice, maxPrice, 
      minYear, maxYear,
      fuel, transmission,
      department
    } = req.query;

    const query = {
      ...(make && { make: String(make) }),
      ...(model && { model: String(model) }),
      ...(minPrice && { minPrice: Number(minPrice) }),
      ...(maxPrice && { maxPrice: Number(maxPrice) }),
      ...(minYear && { minYear: Number(minYear) }),
      ...(maxYear && { maxYear: Number(maxYear) }),
      ...(fuel && { fuel: String(fuel) }),
      ...(transmission && { transmission: String(transmission) }),
      ...(department && { 'location.department': String(department) })
    };

    const cars = findCars(query);
    return res.status(200).json(cars);
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 