/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for handling HTTP modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('http', 'https');
    }
    return config;
  },

  // Headers configuration for security and CORS
  async headers() {
    // Determine the correct origin based on environment
    const allowedOrigin =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_FRONTEND_URL
        : 'http://localhost:3000';

    // Define API URL for connect-src directive
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://unicas-backend-nuevaui.up.railway.app'
        : 'http://localhost:3001';

    // Base CORS headers used across all routes
    const baseCorsHeaders = [
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
      // { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
      { key: 'Access-Control-Allow-Origin', value: '*' }, // Add this value
      {
        key: 'Access-Control-Allow-Headers',
        value: [
          'Authorization',
          'X-CSRF-Token',
          'X-Requested-With',
          'Accept',
          'Accept-Version',
          'Content-Length',
          'Content-MD5',
          'Content-Type',
          'Date',
          'X-Api-Version',
        ].join(','),
      },
    ];

    // Security headers including enhanced CSP
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "img-src 'self' data: https:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          `connect-src 'self' ${apiUrl} ${allowedOrigin} https://*.railway.app`,
          "font-src 'self' data:",
          "frame-src 'self'",
          "media-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
        ].join('; '),
      },
    ];

    return [
      {
        source: '/health.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain' },
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          ...baseCorsHeaders,
          ...securityHeaders,
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
        ],
      },
      // Authentication endpoints configuration
      {
        source: '/auth/:path*',
        headers: [
          ...baseCorsHeaders,
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,OPTIONS',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // Cache preflight requests for 24 hours
          },
          // Additional security headers specific to auth routes
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      // API routes configuration
      {
        source: '/api/:path*',
        headers: [
          ...baseCorsHeaders,
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
