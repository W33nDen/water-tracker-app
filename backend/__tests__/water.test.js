const request = require('supertest');

// Cloudinary is an external service — never hit it from tests.
jest.mock('../src/helpers/cloudinary', () => ({
  uploadAvatar: jest.fn(),
}));

const app = require('../src/app');
const prisma = require('../src/config/prisma');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

let userCounter = 0;
const generateEmail = (prefix = 'water') =>
  `water_${prefix}_${Date.now()}_${++userCounter}_${Math.random()
    .toString(36)
    .slice(2, 7)}@test.watertracker.dev`;

/** Registers a user through the API and returns { email, token, userId }. */
const createUser = async (prefix, dailyNorma = 2000) => {
  const email = generateEmail(prefix);
  const password = 'password123';
  const res = await request(app).post('/api/auth/signup').send({ email, password });
  expect(res.statusCode).toBe(201);

  // Set a specific dailyNorma if requested
  if (dailyNorma !== 2000) {
    await request(app)
      .patch('/api/users/water-rate')
      .set('Authorization', `Bearer ${res.body.token}`)
      .send({ dailyNorma });
  }

  return { email, password, token: res.body.token };
};

const cleanup = () =>
  prisma.user.deleteMany({
    where: { email: { endsWith: '@test.watertracker.dev' } },
  });

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a local ISO string in the given timezone that represents
 * today at hh:mm:ss.
 * Uses the same logic as waterService: toZonedTime from date-fns-tz.
 */
const { toZonedTime, fromZonedTime } = require('date-fns-tz');
const { getTodayUTCBounds } = require('../src/services/waterService');

function isoInZone(tz, h, m, s = 0) {
  const now = new Date();
  const z = toZonedTime(now, tz);
  const local = new Date(z.getFullYear(), z.getMonth(), z.getDate(), h, m, s, 0);
  return fromZonedTime(local, tz).toISOString();
}

function isoNextDayInZone(tz, h = 0, m = 0, s = 0) {
  const now = new Date();
  const z = toZonedTime(now, tz);
  const local = new Date(z.getFullYear(), z.getMonth(), z.getDate() + 1, h, m, s, 0);
  return fromZonedTime(local, tz).toISOString();
}

function isoPrevDayInZone(tz, h = 23, m = 59, s = 59) {
  const now = new Date();
  const z = toZonedTime(now, tz);
  const local = new Date(z.getFullYear(), z.getMonth(), z.getDate() - 1, h, m, s, 0);
  return fromZonedTime(local, tz).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Water Tracking Endpoints Integration Tests', () => {
  beforeAll(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // ───────────────────────── POST /api/water ─────────────────────────────────
  describe('POST /api/water', () => {
    it('creates a record and returns 201 with { id, volume, time }', async () => {
      const { token } = await createUser('create_ok');
      const time = new Date().toISOString();

      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 250, time });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ volume: 250 });
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.time).toBe('string');
    });

    it('accepts volume = 5000 (boundary)', async () => {
      const { token } = await createUser('create_max');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 5000, time: new Date().toISOString() });

      expect(res.statusCode).toBe(201);
      expect(res.body.volume).toBe(5000);
    });

    it('rejects volume = 5001', async () => {
      const { token } = await createUser('create_5001');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 5001, time: new Date().toISOString() });

      expect(res.statusCode).toBe(400);
    });

    it('rejects volume = 0', async () => {
      const { token } = await createUser('create_0');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 0, time: new Date().toISOString() });

      expect(res.statusCode).toBe(400);
    });

    it('rejects negative volume', async () => {
      const { token } = await createUser('create_neg');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: -1, time: new Date().toISOString() });

      expect(res.statusCode).toBe(400);
    });

    it('rejects non-integer volume', async () => {
      const { token } = await createUser('create_float');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 1.5, time: new Date().toISOString() });

      expect(res.statusCode).toBe(400);
    });

    it('rejects invalid time', async () => {
      const { token } = await createUser('create_badtime');
      const res = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 250, time: 'not-a-date' });

      expect(res.statusCode).toBe(400);
    });

    it('returns 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/water')
        .send({ volume: 250, time: new Date().toISOString() });

      expect(res.statusCode).toBe(401);
    });
  });

  // ───────────────────────── PUT /api/water/:id ──────────────────────────────
  describe('PUT /api/water/:id', () => {
    it('updates a record and returns 200 with new data', async () => {
      const { token } = await createUser('update_ok');
      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const newTime = new Date(Date.now() + 60000).toISOString();
      const res = await request(app)
        .put(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 350, time: newTime });

      expect(res.statusCode).toBe(200);
      expect(res.body.volume).toBe(350);
    });

    it('returns 400 when body is empty', async () => {
      const { token } = await createUser('update_empty');
      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const res = await request(app)
        .put(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('returns 404 for a foreign record', async () => {
      const { token: token1 } = await createUser('update_own');
      const { token: token2 } = await createUser('update_other');

      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token1}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const res = await request(app)
        .put(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ volume: 999 });

      expect(res.statusCode).toBe(404);
    });

    it('returns 404 for a non-existent id', async () => {
      const { token } = await createUser('update_nonexist');
      const res = await request(app)
        .put('/api/water/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 100 });

      expect(res.statusCode).toBe(404);
    });

    it('returns 401 when no token', async () => {
      const res = await request(app)
        .put('/api/water/00000000-0000-0000-0000-000000000000')
        .send({ volume: 100 });

      expect(res.statusCode).toBe(401);
    });

    it('rejects volume > 5000 on update', async () => {
      const { token } = await createUser('update_toobig');
      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const res = await request(app)
        .put(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 9999 });

      expect(res.statusCode).toBe(400);
    });
  });

  // ───────────────────────── DELETE /api/water/:id ───────────────────────────
  describe('DELETE /api/water/:id', () => {
    it('deletes a record and returns 204', async () => {
      const { token } = await createUser('delete_ok');
      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const res = await request(app)
        .delete(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      // Record should no longer be in DB
      const inDb = await prisma.waterRecord.findUnique({
        where: { id: create.body.id },
      });
      expect(inDb).toBeNull();
    });

    it('returns 404 for a foreign record', async () => {
      const { token: token1 } = await createUser('delete_own');
      const { token: token2 } = await createUser('delete_other');

      const create = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token1}`)
        .send({ volume: 200, time: new Date().toISOString() });

      const res = await request(app)
        .delete(`/api/water/${create.body.id}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toBe(404);
    });

    it('returns 404 for non-existent id', async () => {
      const { token } = await createUser('delete_nonexist');
      const res = await request(app)
        .delete('/api/water/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('returns 401 when no token', async () => {
      const res = await request(app).delete(
        '/api/water/00000000-0000-0000-0000-000000000000'
      );

      expect(res.statusCode).toBe(401);
    });
  });

  // ───────────────────────── GET /api/water/today ────────────────────────────
  describe('GET /api/water/today', () => {
    it('returns correct percentage for known records (UTC)', async () => {
      const { token } = await createUser('today_pct', 2000);
      const tz = 'UTC';

      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 250, time: isoInZone(tz, 10, 0) });

      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 250, time: isoInZone(tz, 11, 0) });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      expect(res.body.records).toHaveLength(2);
      // 500 / 2000 * 100 = 25
      expect(res.body.percentage).toBe(25);
    });

    it('returns 0% when no records today', async () => {
      const { token } = await createUser('today_empty');
      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz: 'UTC' });

      expect(res.statusCode).toBe(200);
      expect(res.body.records).toHaveLength(0);
      expect(res.body.percentage).toBe(0);
    });

    it('returns 401 when no token', async () => {
      const res = await request(app).get('/api/water/today').query({ tz: 'UTC' });
      expect(res.statusCode).toBe(401);
    });

    it('handles Europe/Amsterdam timezone correctly (record at 23:59:59 is in today)', async () => {
      const { token } = await createUser('today_amsterdam');
      const tz = 'Europe/Amsterdam';

      // 23:59:59 local → should be included in today
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 100, time: isoInZone(tz, 23, 59, 59) });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      expect(res.body.records.length).toBeGreaterThanOrEqual(1);
    });

    it('boundary check (Europe/Kyiv): 00:00:00 is in today, yesterday 23:59:59 and tomorrow 00:00:00 are excluded', async () => {
      const { token } = await createUser('today_kyiv_bounds');
      const tz = 'Europe/Kyiv';

      // 1. Exactly 00:00:00 today (start of day) -> INCLUDED
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 200, time: isoInZone(tz, 0, 0, 0) });

      // 2. Exactly 23:59:59 today (end of day) -> INCLUDED
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 300, time: isoInZone(tz, 23, 59, 59) });

      // 3. Yesterday at 23:59:59 -> EXCLUDED
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 400, time: isoPrevDayInZone(tz, 23, 59, 59) });

      // 4. Tomorrow at 00:00:00 -> EXCLUDED (half-open interval [start, end))
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 500, time: isoNextDayInZone(tz, 0, 0, 0) });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      const volumes = res.body.records.map((r) => r.volume);
      expect(volumes).toContain(200);
      expect(volumes).toContain(300);
      expect(volumes).not.toContain(400);
      expect(volumes).not.toContain(500);
    });

    it('record at 00:00:00 of next day is NOT in today (Europe/Amsterdam)', async () => {
      const { token } = await createUser('today_nextday');
      const tz = 'Europe/Amsterdam';

      // Record at start of next local day — should NOT be in today's list
      const nextDayISO = isoNextDayInZone(tz);

      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 999, time: nextDayISO });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      // The record for next day should not appear in today's list
      const hasNextDay = res.body.records.some((r) => r.volume === 999);
      expect(hasNextDay).toBe(false);
    });

    it('defaults to UTC when no tz param is provided', async () => {
      const { token } = await createUser('today_notz');
      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.records)).toBe(true);
      expect(typeof res.body.percentage).toBe('number');
    });

    it('calculates percentage correctly for 100% norm', async () => {
      const { token } = await createUser('today_100pct', 1000);
      const tz = 'UTC';

      // Create a 1000 ml record (100% of 1000ml norm)
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 1000, time: isoInZone(tz, 12, 0) });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      expect(res.body.percentage).toBe(100);
    });

    it('reports percentage above 100% when exceeded (not capped)', async () => {
      const { token } = await createUser('today_over100', 1000);
      const tz = 'UTC';

      // 1200ml with norm 1000 = 120%
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 600, time: isoInZone(tz, 9, 0) });

      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ volume: 600, time: isoInZone(tz, 10, 0) });

      const res = await request(app)
        .get('/api/water/today')
        .set('Authorization', `Bearer ${token}`)
        .query({ tz });

      expect(res.statusCode).toBe(200);
      expect(res.body.percentage).toBeGreaterThan(100);
    });
  });

  // ───────────────────────── getTodayUTCBounds & DST ──────────────────────────
  describe('getTodayUTCBounds unit tests (DST and boundaries)', () => {
    it('produces exactly 23 hours in UTC during Europe/Kyiv spring DST transition (2026-03-29)', () => {
      // 2026-03-29 is the spring forward DST date in Europe/Kyiv
      const testDate = new Date('2026-03-29T12:00:00Z');
      const { start, end } = getTodayUTCBounds('Europe/Kyiv', testDate);

      // Start: 2026-03-29 00:00:00 local (UTC+2) = 2026-03-28 22:00:00Z
      expect(start.toISOString()).toBe('2026-03-28T22:00:00.000Z');
      // End: 2026-03-30 00:00:00 local (UTC+3) = 2026-03-29 21:00:00Z
      expect(end.toISOString()).toBe('2026-03-29T21:00:00.000Z');

      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBe(23);
    });

    it('produces exactly 25 hours in UTC during Europe/Kyiv autumn DST transition (2026-10-25)', () => {
      // 2026-10-25 is the autumn fall back DST date in Europe/Kyiv
      const testDate = new Date('2026-10-25T12:00:00Z');
      const { start, end } = getTodayUTCBounds('Europe/Kyiv', testDate);

      // Start: 2026-10-25 00:00:00 local (UTC+3) = 2026-10-24 21:00:00Z
      expect(start.toISOString()).toBe('2026-10-24T21:00:00.000Z');
      // End: 2026-10-26 00:00:00 local (UTC+2) = 2026-10-25 22:00:00Z
      expect(end.toISOString()).toBe('2026-10-25T22:00:00.000Z');

      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBe(25);
    });

    it('guarantees half-open interval continuity: today end == tomorrow start (no gap, no overlap)', () => {
      const today = new Date('2026-07-15T10:00:00Z');
      const tomorrow = new Date('2026-07-16T10:00:00Z');

      const boundsToday = getTodayUTCBounds('Europe/Kyiv', today);
      const boundsTomorrow = getTodayUTCBounds('Europe/Kyiv', tomorrow);

      expect(boundsToday.end.toISOString()).toBe(boundsTomorrow.start.toISOString());
    });
  });
});
