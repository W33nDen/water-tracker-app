const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const config = require('../src/config');

describe('Auth Endpoints Integration Tests', () => {
  let userCounter = 0;
  const generateEmail = (prefix = 'user') =>
    `auth_${Date.now()}_${++userCounter}_${Math.random().toString(36).slice(2, 7)}@test.watertracker.dev`;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@test.watertracker.dev',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@test.watertracker.dev',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('should register user with 201, return token and public user fields, set httpOnly cookie, and hash password in DB', async () => {
      const email = generateEmail('signup_success');
      const password = 'password123';

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email, password });

      expect(res.statusCode).toBe(201);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);

      // Verify exact user fields (no password, no token, no id)
      expect(res.body.user).toEqual({
        email,
        name: null,
        gender: 'female',
        dailyNorma: 2000,
        avatarUrl: null,
      });

      // Verify Set-Cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/i);
      expect(tokenCookie).toMatch(/Path=\//i);

      // Verify DB persistence and password hashing
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb).toBeTruthy();
      expect(userInDb.password).not.toBe(password);
      const isPasswordHashed = await bcrypt.compare(password, userInDb.password);
      expect(isPasswordHashed).toBe(true);
      expect(userInDb.token).toBe(res.body.token);
    });

    it('should normalize email to lowercase and trim spaces', async () => {
      const baseEmail = `spaced_${Date.now()}_${++userCounter}@test.watertracker.dev`;
      const inputEmail = `  ${baseEmail.toUpperCase()}  `;

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: inputEmail, password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.email).toBe(baseEmail.toLowerCase());

      const userInDb = await prisma.user.findUnique({
        where: { email: baseEmail.toLowerCase() },
      });
      expect(userInDb).toBeTruthy();
    });

    it('should ignore unknown fields such as confirmPassword and return 201', async () => {
      const email = generateEmail('confirm_pw');

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email,
          password: 'password123',
          confirmPassword: 'password123',
          extraField: 'unexpected',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.email).toBe(email);
    });

    it('should return 409 "Email in use" when registering duplicate email (including case variations)', async () => {
      const email = generateEmail('duplicate');

      await request(app)
        .post('/api/auth/signup')
        .send({ email: email.toLowerCase(), password: 'password123' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: email.toUpperCase(), password: 'password123' });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'Email in use');
    });

    it('should return 400 when email or password is missing or invalid', async () => {
      const validEmail = generateEmail('validation');

      // Missing email
      const res1 = await request(app)
        .post('/api/auth/signup')
        .send({ password: 'password123' });
      expect(res1.statusCode).toBe(400);

      // Invalid email
      const res2 = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'notanemail', password: 'password123' });
      expect(res2.statusCode).toBe(400);

      // Missing password
      const res3 = await request(app)
        .post('/api/auth/signup')
        .send({ email: validEmail });
      expect(res3.statusCode).toBe(400);

      // Password too short (7 chars)
      const res4 = await request(app)
        .post('/api/auth/signup')
        .send({ email: validEmail, password: 'short12' });
      expect(res4.statusCode).toBe(400);

      // Password too long (65 chars)
      const res5 = await request(app)
        .post('/api/auth/signup')
        .send({ email: validEmail, password: 'a'.repeat(65) });
      expect(res5.statusCode).toBe(400);

      // Empty body
      const res6 = await request(app)
        .post('/api/auth/signup')
        .send({});
      expect(res6.statusCode).toBe(400);
    });

    it('should accept passwords with boundary lengths of 8 and 64 characters', async () => {
      const email8 = generateEmail('boundary8');
      const res8 = await request(app)
        .post('/api/auth/signup')
        .send({ email: email8, password: '12345678' });
      expect(res8.statusCode).toBe(201);

      const email64 = generateEmail('boundary64');
      const res64 = await request(app)
        .post('/api/auth/signup')
        .send({ email: email64, password: 'a'.repeat(64) });
      expect(res64.statusCode).toBe(201);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should log in successfully, return 200 with token and user, set cookie, and update DB token', async () => {
      const email = generateEmail('signin_success');
      const password = 'password123';

      await request(app)
        .post('/api/auth/signup')
        .send({ email, password });

      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email, password });

      expect(res.statusCode).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toEqual({
        email,
        name: null,
        gender: 'female',
        dailyNorma: 2000,
        avatarUrl: null,
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();

      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.token).toBe(res.body.token);
    });

    it('should return 401 "Email or password is wrong" for incorrect password', async () => {
      const email = generateEmail('wrong_password');
      await request(app)
        .post('/api/auth/signup')
        .send({ email, password: 'password123' });

      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email or password is wrong');
    });

    it('should return 401 "Email or password is wrong" for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@test.watertracker.dev',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email or password is wrong');
    });

    it('should return 400 for invalid body on signin', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'bademail', password: '123' });

      expect(res.statusCode).toBe(400);
    });

    it('should invalidate old token when signing in again', async () => {
      const email = generateEmail('session_override');
      const password = 'password123';

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email, password });
      const firstToken = signupRes.body.token;

      // Ensure first token works
      const firstCheck = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${firstToken}`);
      expect(firstCheck.statusCode).toBe(200);

      // Wait for JWT iat (1-second resolution) to advance
      await new Promise((resolve) => setTimeout(resolve, 1050));

      // Sign in again -> generates new token and updates user.token in DB
      const signinRes = await request(app)
        .post('/api/auth/signin')
        .send({ email, password });
      const secondToken = signinRes.body.token;
      expect(secondToken).not.toBe(firstToken);

      // Old token must now be rejected with 401
      const oldTokenCheck = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${firstToken}`);
      expect(oldTokenCheck.statusCode).toBe(401);

      // New token must succeed
      const newTokenCheck = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${secondToken}`);
      expect(newTokenCheck.statusCode).toBe(200);
    });
  });

  describe('GET /api/users/current', () => {
    it('should return 200 with user profile via httpOnly cookie', async () => {
      const email = generateEmail('current_cookie');
      const password = 'password123';

      const agent = request.agent(app);

      await agent
        .post('/api/auth/signup')
        .send({ email, password });

      const res = await agent.get('/api/users/current');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        email,
        name: null,
        gender: 'female',
        dailyNorma: 2000,
        avatarUrl: null,
      });
    });

    it('should return 200 with user profile via Authorization: Bearer header', async () => {
      const email = generateEmail('current_bearer');
      const password = 'password123';

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email, password });

      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${signupRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        email,
        name: null,
        gender: 'female',
        dailyNorma: 2000,
        avatarUrl: null,
      });
    });

    it('should prioritize cookie over Bearer header (valid cookie + invalid Bearer -> 200)', async () => {
      const email = generateEmail('cookie_priority');
      const password = 'password123';

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email, password });

      const res = await request(app)
        .get('/api/users/current')
        .set('Cookie', `token=${signupRes.body.token}`)
        .set('Authorization', 'Bearer invalid_garbage_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(email);
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/users/current');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });

    it('should return 401 for unsupported authorization schemes (e.g. Basic)', async () => {
      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', 'Basic dXNlcjpwYXNz');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });

    it('should return 401 for empty Bearer token', async () => {
      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', 'Bearer ');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });

    it('should return 401 for JWT signed with a different secret', async () => {
      const email = generateEmail('wrong_secret');
      const user = await prisma.user.create({
        data: {
          email,
          password: 'hashedpassword',
        },
      });

      const alienToken = jwt.sign({ id: user.id }, 'some_other_secret');
      await prisma.user.update({
        where: { id: user.id },
        data: { token: alienToken },
      });

      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${alienToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });

    it('should return 401 for an expired token', async () => {
      const email = generateEmail('expired');
      const user = await prisma.user.create({
        data: {
          email,
          password: 'hashedpassword',
        },
      });

      const expiredToken = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: -10,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { token: expiredToken },
      });

      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });

    it('should return 401 for a valid JWT with non-existent user id', async () => {
      const nonExistentToken = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000000' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${nonExistentToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should log out via cookie, clear cookie, set DB token to null, and invalidate subsequent requests', async () => {
      const email = generateEmail('logout_cookie');
      const password = 'password123';

      const agent = request.agent(app);

      await agent
        .post('/api/auth/signup')
        .send({ email, password });

      const logoutRes = await agent.post('/api/auth/logout');
      expect(logoutRes.statusCode).toBe(204);
      expect(logoutRes.body).toEqual({});

      // Set-Cookie header must clear the token cookie
      const cookies = logoutRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();

      // DB token must be null
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.token).toBeNull();

      // Subsequent current check with the same agent must fail
      const currentRes = await agent.get('/api/users/current');
      expect(currentRes.statusCode).toBe(401);
    });

    it('should log out via Bearer token and invalidate subsequent requests and duplicate logout', async () => {
      const email = generateEmail('logout_bearer');
      const password = 'password123';

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email, password });

      const token = signupRes.body.token;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(logoutRes.statusCode).toBe(204);

      // Verify token in DB is null
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.token).toBeNull();

      // Subsequent current user check must be 401
      const currentRes = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${token}`);
      expect(currentRes.statusCode).toBe(401);

      // Repeated logout must also be 401
      const repeatLogoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(repeatLogoutRes.statusCode).toBe(401);
    });

    it('should return 401 when logging out without a token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized');
    });
  });

  describe('General & Middleware', () => {
    it('should configure CORS with allowed origin and credentials', async () => {
      const clientOrigin = config.clientUrl.split(',')[0].trim();

      const res = await request(app)
        .get('/api/health')
        .set('Origin', clientOrigin);

      expect(res.statusCode).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(clientOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should return 400 "Invalid JSON body" for malformed JSON request', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{"email": invalid_json_here');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid JSON body');
    });
  });
});
