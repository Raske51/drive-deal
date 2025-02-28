import { NextRequest } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export default function middleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Redirect API requests to Cloudflare Worker
  if (url.pathname.startsWith('/api/')) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`,
      },
    });
  }
  
  return new Response(null, {
    status: 404,
  });
} 