import { Router } from 'itty-router';
import { Env, User, Car, AuthRequest, ExecutionContext } from './types';
import { hashPassword, createToken, verifyPassword, verifyToken } from './auth';
import { scrapeCarListings, CarListing } from './services/scraper';

// Create a new router
const router = Router();

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Auth middleware
const auth = async (request: Request, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Add user to request object
  (request as AuthRequest).user = user;
  return request;
};

// Register route
router.post('/api/auth/register', async (request: Request, env: Env) => {
  try {
    const body = await request.json() as { email?: string; password?: string; name?: string };
    const { email, password, name } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user already exists
    const existingUser = await env.DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const result = await env.DB
      .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .bind(email, passwordHash, name || null)
      .run();

    if (!result.success) {
      throw new Error('Failed to create user');
    }

    // Get the created user
    const user = await env.DB
      .prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    if (!user) {
      throw new Error('Failed to retrieve created user');
    }

    // Generate token
    const token = await createToken(user, env);

    return new Response(JSON.stringify({ 
      message: 'User registered successfully',
      token,
      user
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Login route
router.post('/api/auth/login', async (request: Request, env: Env) => {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user by email
    const user = await env.DB
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User & { password_hash: string }>();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    // Generate token
    const token = await createToken(userWithoutPassword, env);

    return new Response(JSON.stringify({ 
      message: 'Login successful',
      token,
      user: userWithoutPassword
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Get cars route with pagination
router.get('/api/cars', async (request: Request, env: Env) => {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    
    // Pagination parameters
    const page = parseInt(searchParams.page as string) || 1;
    const limit = parseInt(searchParams.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Build query
    let query = 'SELECT * FROM cars WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM cars WHERE 1=1';
    const params: any[] = [];
    const countParams: any[] = [];

    // Filter by brand
    if (searchParams.brand) {
      const brandFilter = ` AND brand LIKE ?`;
      query += brandFilter;
      countQuery += brandFilter;
      params.push(`%${searchParams.brand}%`);
      countParams.push(`%${searchParams.brand}%`);
    }

    // Filter by model
    if (searchParams.model) {
      const modelFilter = ` AND model LIKE ?`;
      query += modelFilter;
      countQuery += modelFilter;
      params.push(`%${searchParams.model}%`);
      countParams.push(`%${searchParams.model}%`);
    }

    // Filter by min price
    if (searchParams.minPrice) {
      const minPriceFilter = ` AND price >= ?`;
      query += minPriceFilter;
      countQuery += minPriceFilter;
      params.push(parseFloat(searchParams.minPrice as string));
      countParams.push(parseFloat(searchParams.minPrice as string));
    }

    // Filter by max price
    if (searchParams.maxPrice) {
      const maxPriceFilter = ` AND price <= ?`;
      query += maxPriceFilter;
      countQuery += maxPriceFilter;
      params.push(parseFloat(searchParams.maxPrice as string));
      countParams.push(parseFloat(searchParams.maxPrice as string));
    }

    // Filter by year
    if (searchParams.year) {
      const yearFilter = ` AND year = ?`;
      query += yearFilter;
      countQuery += yearFilter;
      params.push(parseInt(searchParams.year as string));
      countParams.push(parseInt(searchParams.year as string));
    }

    // Filter by fuel type
    if (searchParams.fuelType) {
      const fuelFilter = ` AND fuel_type = ?`;
      query += fuelFilter;
      countQuery += fuelFilter;
      params.push(searchParams.fuelType);
      countParams.push(searchParams.fuelType);
    }

    // Filter by transmission
    if (searchParams.transmission) {
      const transmissionFilter = ` AND transmission = ?`;
      query += transmissionFilter;
      countQuery += transmissionFilter;
      params.push(searchParams.transmission);
      countParams.push(searchParams.transmission);
    }

    // Filter by seller
    if (searchParams.sellerId) {
      const sellerFilter = ` AND seller_id = ?`;
      query += sellerFilter;
      countQuery += sellerFilter;
      params.push(parseInt(searchParams.sellerId as string));
      countParams.push(parseInt(searchParams.sellerId as string));
    }

    // Order by
    query += ' ORDER BY created_at DESC';
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute queries
    const [cars, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...params).all<Car>(),
      env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()
    ]);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const carResults = cars.results || [];

    return new Response(JSON.stringify({ 
      cars: carResults,
      count: carResults.length,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: searchParams
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Get car by ID
router.get('/api/cars/:id', async (request: Request & { params?: { id: string } }, env: Env) => {
  try {
    const { id } = request.params || {};
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Get car by ID
    const car = await env.DB
      .prepare('SELECT * FROM cars WHERE id = ?')
      .bind(parseInt(id))
      .first<Car>();

    if (!car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get seller information
    const seller = await env.DB
      .prepare('SELECT id, name, email FROM users WHERE id = ?')
      .bind(car.seller_id)
      .first<{ id: number; name: string; email: string }>();

    return new Response(JSON.stringify({ 
      car,
      seller
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Create car route
router.post('/api/cars', async (request: Request, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const body = await request.json() as Partial<Car>;
    
    // Validate required fields
    const requiredFields = ['title', 'price', 'year', 'mileage', 'location', 'brand', 'model', 'fuel_type', 'transmission'];
    const missingFields = requiredFields.filter(field => !body[field as keyof Partial<Car>]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        fields: missingFields 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Insert car into database
    const result = await env.DB
      .prepare(`
        INSERT INTO cars (
          title, description, price, year, mileage,
          location, brand, model, fuel_type,
          transmission, image_url, seller_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        body.title,
        body.description || null,
        body.price,
        body.year,
        body.mileage,
        body.location,
        body.brand,
        body.model,
        body.fuel_type,
        body.transmission,
        body.image_url || null,
        user.id
      )
      .run();

    if (!result.success) {
      throw new Error('Failed to create car');
    }

    // Get the created car
    const car = await env.DB
      .prepare('SELECT * FROM cars WHERE id = (SELECT last_insert_rowid())')
      .first<Car>();

    if (!car) {
      throw new Error('Failed to retrieve created car');
    }

    return new Response(JSON.stringify({ 
      message: 'Car created successfully',
      car
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Update car route
router.put('/api/cars/:id', async (request: Request & { params?: { id: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { id } = request.params || {};
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    const body = await request.json() as Partial<Car>;
    
    // Check if car exists and belongs to the user
    const existingCar = await env.DB
      .prepare('SELECT * FROM cars WHERE id = ?')
      .bind(parseInt(id))
      .first<Car>();

    if (!existingCar) {
      return new Response(JSON.stringify({ error: 'Car not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (existingCar.seller_id !== user.id) {
      return new Response(JSON.stringify({ error: 'You do not have permission to update this car' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Build update query
    const updateFields = [];
    const updateParams = [];
    
    // Only update fields that are provided
    if (body.title !== undefined) {
      updateFields.push('title = ?');
      updateParams.push(body.title);
    }
    
    if (body.description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(body.description);
    }
    
    if (body.price !== undefined) {
      updateFields.push('price = ?');
      updateParams.push(body.price);
    }
    
    if (body.year !== undefined) {
      updateFields.push('year = ?');
      updateParams.push(body.year);
    }
    
    if (body.mileage !== undefined) {
      updateFields.push('mileage = ?');
      updateParams.push(body.mileage);
    }
    
    if (body.location !== undefined) {
      updateFields.push('location = ?');
      updateParams.push(body.location);
    }
    
    if (body.brand !== undefined) {
      updateFields.push('brand = ?');
      updateParams.push(body.brand);
    }
    
    if (body.model !== undefined) {
      updateFields.push('model = ?');
      updateParams.push(body.model);
    }
    
    if (body.fuel_type !== undefined) {
      updateFields.push('fuel_type = ?');
      updateParams.push(body.fuel_type);
    }
    
    if (body.transmission !== undefined) {
      updateFields.push('transmission = ?');
      updateParams.push(body.transmission);
    }
    
    if (body.image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateParams.push(body.image_url);
    }
    
    // Add updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // If no fields to update, return the existing car
    if (updateFields.length === 1) {
      return new Response(JSON.stringify({ 
        message: 'No changes to update',
        car: existingCar
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Add car ID to params
    updateParams.push(parseInt(id));
    
    // Update car
    const result = await env.DB
      .prepare(`UPDATE cars SET ${updateFields.join(', ')} WHERE id = ?`)
      .bind(...updateParams)
      .run();

    if (!result.success) {
      throw new Error('Failed to update car');
    }

    // Get the updated car
    const updatedCar = await env.DB
      .prepare('SELECT * FROM cars WHERE id = ?')
      .bind(parseInt(id))
      .first<Car>();

    if (!updatedCar) {
      throw new Error('Failed to retrieve updated car');
    }

    return new Response(JSON.stringify({ 
      message: 'Car updated successfully',
      car: updatedCar
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Delete car route
router.delete('/api/cars/:id', async (request: Request & { params?: { id: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { id } = request.params || {};
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if car exists and belongs to the user
    const existingCar = await env.DB
      .prepare('SELECT * FROM cars WHERE id = ?')
      .bind(parseInt(id))
      .first<Car>();

    if (!existingCar) {
      return new Response(JSON.stringify({ error: 'Car not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (existingCar.seller_id !== user.id) {
      return new Response(JSON.stringify({ error: 'You do not have permission to delete this car' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Delete car
    const result = await env.DB
      .prepare('DELETE FROM cars WHERE id = ?')
      .bind(parseInt(id))
      .run();

    if (!result.success) {
      throw new Error('Failed to delete car');
    }

    return new Response(JSON.stringify({ 
      message: 'Car deleted successfully',
      id: parseInt(id)
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Get user favorites
router.get('/api/favorites', async (request: Request, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    
    // Get user favorites with car details
    const favorites = await env.DB
      .prepare(`
        SELECT c.*, f.created_at as favorited_at
        FROM favorites f
        JOIN cars c ON f.car_id = c.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `)
      .bind(user.id)
      .all<Car & { favorited_at: string }>();

    const favoriteResults = favorites.results || [];

    return new Response(JSON.stringify({ 
      favorites: favoriteResults,
      count: favoriteResults.length
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Add to favorites
router.post('/api/favorites/:carId', async (request: Request & { params?: { carId: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { carId } = request.params || {};
    
    if (!carId) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if car exists
    const car = await env.DB
      .prepare('SELECT id FROM cars WHERE id = ?')
      .bind(parseInt(carId))
      .first<{ id: number }>();

    if (!car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if already in favorites
    const existingFavorite = await env.DB
      .prepare('SELECT user_id, car_id FROM favorites WHERE user_id = ? AND car_id = ?')
      .bind(user.id, parseInt(carId))
      .first();

    if (existingFavorite) {
      return new Response(JSON.stringify({ 
        message: 'Car is already in favorites',
        favorite: existingFavorite
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Add to favorites
    const result = await env.DB
      .prepare('INSERT INTO favorites (user_id, car_id) VALUES (?, ?)')
      .bind(user.id, parseInt(carId))
      .run();

    if (!result.success) {
      throw new Error('Failed to add car to favorites');
    }

    return new Response(JSON.stringify({ 
      message: 'Car added to favorites',
      favorite: {
        user_id: user.id,
        car_id: parseInt(carId),
        created_at: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Remove from favorites
router.delete('/api/favorites/:carId', async (request: Request & { params?: { carId: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { carId } = request.params || {};
    
    if (!carId) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if in favorites
    const existingFavorite = await env.DB
      .prepare('SELECT user_id, car_id FROM favorites WHERE user_id = ? AND car_id = ?')
      .bind(user.id, parseInt(carId))
      .first();

    if (!existingFavorite) {
      return new Response(JSON.stringify({ error: 'Car is not in favorites' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Remove from favorites
    const result = await env.DB
      .prepare('DELETE FROM favorites WHERE user_id = ? AND car_id = ?')
      .bind(user.id, parseInt(carId))
      .run();

    if (!result.success) {
      throw new Error('Failed to remove car from favorites');
    }

    return new Response(JSON.stringify({ 
      message: 'Car removed from favorites',
      favorite: {
        user_id: user.id,
        car_id: parseInt(carId)
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Check if car is in favorites
router.get('/api/favorites/:carId', async (request: Request & { params?: { carId: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { carId } = request.params || {};
    
    if (!carId) {
      return new Response(JSON.stringify({ error: 'Car ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if in favorites
    const favorite = await env.DB
      .prepare('SELECT user_id, car_id, created_at FROM favorites WHERE user_id = ? AND car_id = ?')
      .bind(user.id, parseInt(carId))
      .first();

    return new Response(JSON.stringify({ 
      isFavorite: !!favorite,
      favorite: favorite || null
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Get user profile
router.get('/api/profile', async (request: Request, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    
    // Get user profile with additional information
    const profile = await env.DB
      .prepare(`
        SELECT 
          u.id, u.email, u.name, u.created_at, u.updated_at,
          (SELECT COUNT(*) FROM cars WHERE seller_id = u.id) as cars_count,
          (SELECT COUNT(*) FROM favorites WHERE user_id = u.id) as favorites_count
        FROM users u
        WHERE u.id = ?
      `)
      .bind(user.id)
      .first();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ profile }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Update user profile
router.put('/api/profile', async (request: Request, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const body = await request.json() as { name?: string; email?: string; currentPassword?: string; newPassword?: string };
    
    // Build update query
    const updateFields = [];
    const updateParams = [];
    
    // Update name if provided
    if (body.name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(body.name);
    }
    
    // Update email if provided
    if (body.email !== undefined && body.email !== user.email) {
      // Check if email is already taken
      const existingUser = await env.DB
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .bind(body.email, user.id)
        .first();

      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Email is already taken' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      updateFields.push('email = ?');
      updateParams.push(body.email);
    }
    
    // Update password if provided
    if (body.currentPassword && body.newPassword) {
      // Get current password hash
      const userData = await env.DB
        .prepare('SELECT password_hash FROM users WHERE id = ?')
        .bind(user.id)
        .first<{ password_hash: string }>();
      
      if (!userData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // Verify current password
      const isPasswordValid = await verifyPassword(body.currentPassword, userData.password_hash);
      if (!isPasswordValid) {
        return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(body.newPassword);
      
      updateFields.push('password_hash = ?');
      updateParams.push(newPasswordHash);
    }
    
    // Add updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // If no fields to update, return the existing user
    if (updateFields.length === 1) {
      return new Response(JSON.stringify({ 
        message: 'No changes to update',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Add user ID to params
    updateParams.push(user.id);
    
    // Update user
    const result = await env.DB
      .prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`)
      .bind(...updateParams)
      .run();

    if (!result.success) {
      throw new Error('Failed to update profile');
    }

    // Get the updated user
    const updatedUser = await env.DB
      .prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?')
      .bind(user.id)
      .first<User>();

    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    // Generate new token if email or password changed
    let token = null;
    if (body.email !== undefined || (body.currentPassword && body.newPassword)) {
      token = await createToken(updatedUser, env);
    }

    return new Response(JSON.stringify({ 
      message: 'Profile updated successfully',
      user: updatedUser,
      ...(token ? { token } : {})
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Scrape car listings from external sources
router.get('/api/scrape', async (request: Request, env: Env) => {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    
    // Extraire les paramètres de recherche
    const params = {
      brand: searchParams.brand as string | undefined,
      model: searchParams.model as string | undefined,
      minPrice: searchParams.minPrice as string | undefined,
      maxPrice: searchParams.maxPrice as string | undefined,
      minYear: searchParams.minYear as string | undefined,
      maxYear: searchParams.maxYear as string | undefined,
      sources: searchParams.sources ? (searchParams.sources as string).split(',') : undefined
    };
    
    // Vérifier si au moins un paramètre de recherche est fourni
    if (!params.brand && !params.model && !params.minPrice && !params.maxPrice && !params.minYear && !params.maxYear) {
      return new Response(JSON.stringify({ 
        error: 'At least one search parameter is required',
        validParameters: ['brand', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'sources']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Scraper les annonces
    const result = await scrapeCarListings(params, env);
    
    // Stocker les annonces dans la base de données si l'utilisateur est authentifié
    let savedListings: { id: number; external_id: string }[] = [];
    
    // Vérifier si l'utilisateur est authentifié
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const user = await verifyToken(token, env);
      
      if (user) {
        // Stocker uniquement les annonces qui n'existent pas déjà
        const existingListings = await env.DB
          .prepare('SELECT external_id FROM external_listings WHERE user_id = ?')
          .bind(user.id)
          .all<{ external_id: string }>();
        
        const existingListingsResults = existingListings.results || [];
        const existingIds = new Set(existingListingsResults.map((listing: { external_id: string }) =>
          listing.external_id));
        
        // Filtrer les annonces qui n'existent pas déjà
        const newListings = result.listings.filter(listing => !existingIds.has(`${listing.source}:${listing.listing_id}`));
        
        // Stocker les nouvelles annonces
        if (newListings.length > 0) {
          // Créer la table si elle n'existe pas
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS external_listings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              external_id TEXT UNIQUE NOT NULL,
              title TEXT NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              location TEXT NOT NULL,
              year INTEGER,
              mileage INTEGER,
              brand TEXT,
              model TEXT,
              fuel_type TEXT,
              transmission TEXT,
              image_url TEXT,
              source_url TEXT NOT NULL,
              source TEXT NOT NULL,
              user_id INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `).run();
          
          // Insérer les nouvelles annonces
          for (const listing of newListings) {
            const externalId = `${listing.source}:${listing.listing_id}`;
            
            const result = await env.DB
              .prepare(`
                INSERT INTO external_listings (
                  external_id, title, price, location, year, mileage,
                  brand, model, fuel_type, transmission, image_url,
                  source_url, source, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `)
              .bind(
                externalId,
                listing.title,
                listing.price,
                listing.location,
                listing.year || null,
                listing.mileage || null,
                listing.brand || null,
                listing.model || null,
                listing.fuel_type || null,
                listing.transmission || null,
                listing.image_url || null,
                listing.source_url,
                listing.source,
                user.id
              )
              .run();
            
            if (result.success) {
              savedListings.push({
                id: result.meta.last_row_id as number,
                external_id: externalId
              });
            }
          }
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      listings: result.listings,
      count: result.listings.length,
      sources: result.sources,
      saved: savedListings.length > 0 ? {
        count: savedListings.length,
        listings: savedListings
      } : undefined
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Get saved external listings
router.get('/api/external-listings', async (request: Request, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    
    // Pagination parameters
    const page = parseInt(searchParams.page as string) || 1;
    const limit = parseInt(searchParams.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Build query
    let query = 'SELECT * FROM external_listings WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM external_listings WHERE user_id = ?';
    const params: any[] = [user.id];
    const countParams: any[] = [user.id];
    
    // Filter by source
    if (searchParams.source) {
      const sourceFilter = ` AND source = ?`;
      query += sourceFilter;
      countQuery += sourceFilter;
      params.push(searchParams.source);
      countParams.push(searchParams.source);
    }
    
    // Filter by brand
    if (searchParams.brand) {
      const brandFilter = ` AND brand LIKE ?`;
      query += brandFilter;
      countQuery += brandFilter;
      params.push(`%${searchParams.brand}%`);
      countParams.push(`%${searchParams.brand}%`);
    }
    
    // Filter by model
    if (searchParams.model) {
      const modelFilter = ` AND model LIKE ?`;
      query += modelFilter;
      countQuery += modelFilter;
      params.push(`%${searchParams.model}%`);
      countParams.push(`%${searchParams.model}%`);
    }
    
    // Filter by min price
    if (searchParams.minPrice) {
      const minPriceFilter = ` AND price >= ?`;
      query += minPriceFilter;
      countQuery += minPriceFilter;
      params.push(parseFloat(searchParams.minPrice as string));
      countParams.push(parseFloat(searchParams.minPrice as string));
    }
    
    // Filter by max price
    if (searchParams.maxPrice) {
      const maxPriceFilter = ` AND price <= ?`;
      query += maxPriceFilter;
      countQuery += maxPriceFilter;
      params.push(parseFloat(searchParams.maxPrice as string));
      countParams.push(parseFloat(searchParams.maxPrice as string));
    }
    
    // Order by
    query += ' ORDER BY created_at DESC';
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Execute queries
    const [listings, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...params).all(),
      env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()
    ]);
    
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const listingResults = listings.results || [];
    
    return new Response(JSON.stringify({ 
      listings: listingResults,
      count: listingResults.length,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: searchParams
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Delete external listing
router.delete('/api/external-listings/:id', async (request: Request & { params?: { id: string } }, env: Env) => {
  // Authenticate user
  const authResult = await auth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const user = (request as AuthRequest).user!;
    const { id } = request.params || {};
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Listing ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Check if listing exists and belongs to the user
    const existingListing = await env.DB
      .prepare('SELECT id FROM external_listings WHERE id = ? AND user_id = ?')
      .bind(parseInt(id), user.id)
      .first();

    if (!existingListing) {
      return new Response(JSON.stringify({ error: 'Listing not found or you do not have permission to delete it' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Delete listing
    const result = await env.DB
      .prepare('DELETE FROM external_listings WHERE id = ?')
      .bind(parseInt(id))
      .run();

    if (!result.success) {
      throw new Error('Failed to delete listing');
    }

    return new Response(JSON.stringify({ 
      message: 'Listing deleted successfully',
      id: parseInt(id)
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace';
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Add a test route
router.get('/test', () => {
  return new Response(JSON.stringify({ message: 'API is working!' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});

// 404 for everything else
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export the handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
}; 