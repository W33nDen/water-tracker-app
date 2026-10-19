require('dotenv').config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '23h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  databaseUrl: process.env.DATABASE_URL || '',
  prisma: require('./prisma'),
};
