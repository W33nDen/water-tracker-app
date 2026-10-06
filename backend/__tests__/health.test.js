const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message', 'Server is running');
  });
});

describe('GET /api/nonexistent', () => {
  it('should return 404 for undefined routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.statusCode).toBe(404);
  });
});
