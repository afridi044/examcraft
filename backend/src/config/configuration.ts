export default () => ({
  // Application Configuration
  port: parseInt(process.env.PORT || '5001', 10),
  environment: process.env.NODE_ENV || 'development',
  version: process.env.VERSION || '1.0.0',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET, // Add Supabase JWT secret
  },

  // OpenRouter AI Configuration
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },

  // Frontend URL for CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // Rate Limiting Configuration
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 1 minute
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests per minute
  },
});
 