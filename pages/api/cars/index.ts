import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { Car, CarSearchParams } from '../../../models/Car';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { ObjectId } from 'mongodb';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { db } = await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const params = req.query as unknown as CarSearchParams;
        const query: any = {};

        // Construction de la requête MongoDB
        if (params.brand) query.brand = new RegExp(params.brand, 'i');
        if (params.model) query.model = new RegExp(params.model, 'i');
        if (params.minPrice || params.maxPrice) {
          query.price = {};
          if (params.minPrice) query.price.$gte = Number(params.minPrice);
          if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
        }
        if (params.minYear || params.maxYear) {
          query.year = {};
          if (params.minYear) query.year.$gte = Number(params.minYear);
          if (params.maxYear) query.year.$lte = Number(params.maxYear);
        }
        if (params.fuel?.length) query.fuel = { $in: params.fuel };
        if (params.transmission?.length) query.transmission = { $in: params.transmission };
        if (params.location?.department) {
          query['location.department'] = params.location.department;
        }
        if (params.sellerType?.length) {
          query['seller.type'] = { $in: params.sellerType };
        }

        // Options de tri et pagination
        const sortOptions: any = {};
        if (params.sortBy) {
          sortOptions[params.sortBy] = params.sortOrder === 'desc' ? -1 : 1;
        } else {
          sortOptions.createdAt = -1; // Par défaut, tri par date décroissante
        }

        const limit = Number(params.limit) || 20;
        const offset = Number(params.offset) || 0;

        const cars = await db.collection('cars')
          .find(query)
          .sort(sortOptions)
          .skip(offset)
          .limit(limit)
          .toArray();

        const total = await db.collection('cars').countDocuments(query);

        return res.status(200).json({
          cars,
          total,
          limit,
          offset
        });
      } catch (error) {
        console.error('Error fetching cars:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const carData: Car = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastScrapedAt: new Date(),
          status: 'active'
        };

        const result = await db.collection('cars').insertOne(carData);
        
        return res.status(201).json({
          message: 'Car created successfully',
          car: {
            ...carData,
            _id: result.insertedId
          }
        });
      } catch (error) {
        console.error('Error creating car:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); 