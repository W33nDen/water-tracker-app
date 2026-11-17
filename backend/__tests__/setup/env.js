const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const testEnv = path.resolve(__dirname, '../../.env.test');

if (!fs.existsSync(testEnv)) {
  throw new Error(
    'FAIL-CLOSED: backend/.env.test is missing. Tests require an isolated local test database and must not fall back to backend/.env (production database).'
  );
}

dotenv.config({ path: testEnv, override: true, quiet: true });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

const dbUrl = process.env.DATABASE_URL || '';
const match = dbUrl.match(/postgresql:\/\/[^@]+@([^/:]+)[:/]([^?]+)/);
const host = match ? match[1].toLowerCase() : '';

const ALLOWED_TEST_HOSTS = ['localhost', '127.0.0.1'];
if (!ALLOWED_TEST_HOSTS.includes(host)) {
  throw new Error(
    `FAIL-CLOSED: DATABASE_URL host "${host || 'UNKNOWN'}" is not an allowed local test host (allowed: ${ALLOWED_TEST_HOSTS.join(', ')}). Aborting tests to protect remote/production database.`
  );
}
