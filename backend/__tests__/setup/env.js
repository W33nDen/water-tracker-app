const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const testEnv = path.resolve(__dirname, '../../.env.test');
dotenv.config(
  fs.existsSync(testEnv)
    ? { path: testEnv, override: true, quiet: true }
    : { quiet: true }
);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
