import { NextResponse } from 'next/server';

/**
 * Health Check API Endpoint
 * 
 * This endpoint is used by Docker health checks to verify that the
 * application is running and responsive.
 */

export async function GET() {
  try {
    // Basic health check - verify the application is responding
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'examcraft-frontend',
      version: process.env.VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
      // Check if essential environment variables are present
      config: {
        supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
      }
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    // Return unhealthy status if there's an error
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'examcraft-frontend'
      }, 
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}

// Support HEAD requests for basic connectivity checks
export async function HEAD() {
  return new Response(null, { status: 200 });
} 