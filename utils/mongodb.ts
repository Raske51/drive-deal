/**
 * DEPRECATED: This file is kept for backward compatibility.
 * Please use utils/database.ts instead.
 */

import { executeQuery } from './database';

// Mock MongoDB client for compatibility
export async function connectToDatabase() {
  console.warn('Warning: connectToDatabase from mongodb.ts is deprecated. Please use executeQuery from database.ts instead.');
  
  // Return a mock db object with collection method
  return {
    db: {
      collection: (collectionName: string) => ({
        findOne: async (query: any) => {
          console.warn(`Deprecated: findOne called on ${collectionName}`, query);
          const id = query._id?.toString() || query.id;
          if (id) {
            const result = await executeQuery(
              `SELECT * FROM ${collectionName} WHERE id = ? LIMIT 1`,
              [id]
            );
            return result.results?.[0] || null;
          }
          return null;
        },
        find: async (query: any) => {
          console.warn(`Deprecated: find called on ${collectionName}`, query);
          // Return a mock cursor
          return {
            toArray: async () => {
              const result = await executeQuery(`SELECT * FROM ${collectionName} LIMIT 100`, []);
              return result.results || [];
            }
          };
        },
        updateOne: async (query: any, update: any) => {
          console.warn(`Deprecated: updateOne called on ${collectionName}`, query, update);
          return { matchedCount: 1, modifiedCount: 1 };
        },
        deleteOne: async (query: any) => {
          console.warn(`Deprecated: deleteOne called on ${collectionName}`, query);
          return { deletedCount: 1 };
        },
        insertOne: async (doc: any) => {
          console.warn(`Deprecated: insertOne called on ${collectionName}`, doc);
          return { insertedId: 'mock-id' };
        }
      })
    },
    client: {}
  };
} 