const request = require('supertest');
const bcrypt = require('bcryptjs');

// Cloudinary is an external service — never hit it from tests.
jest.mock('../src/helpers/cloudinary', () => ({
  uploadAvatar: jest.fn(),
}));

const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { uploadAvatar } = require('../src/helpers/cloudinary');

// 1×1 transparent PNG
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

describe('Users Endpoints Integration Tests', () => {
  let userCounter = 0;
  const generateEmail = (prefix = 'user') =>
    `users_${prefix}_${Date.now()}_${++userCounter}_${Math.random().toString(36).slice(2, 7)}@test.watertracker.dev`;

  /** Registers a user through the API and returns { email, password, token }. */
  const createUser = async (prefix) => {
    const email = generateEmail(prefix);
    const password = 'password123';
    const res = await request(app).post('/api/auth/signup').send({ email, password });
    return { email, password, token: res.body.token };
  };

  const cleanup = () =>
    prisma.user.deleteMany({ where: { email: { endsWith: '@test.watertracker.dev' } } });

  beforeAll(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  beforeEach(() => {
    uploadAvatar.mockReset();
  });

  describe('PATCH /api/users/avatar', () => {
    it('should upload avatar, store URL in DB and return { avatarUrl }', async () => {
      const { email, token } = await createUser('avatar_ok');
      uploadAvatar.mockResolvedValue('https://res.cloudinary.com/demo/image/upload/avatar.png');

      const res = await request(app)
        .patch('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', PNG_1PX, { filename: 'me.png', contentType: 'image/png' });

      expect(res.statusCode).toBe(200);
      expect(res.body.avatarUrl).toMatch(
        /^https:\/\/res\.cloudinary\.com\/demo\/image\/upload\/avatar\.png\?v=\d+$/
      );
      expect(uploadAvatar).toHaveBeenCalledTimes(1);
      expect(Buffer.isBuffer(uploadAvatar.mock.calls[0][0])).toBe(true);

      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.avatarUrl).toBe(res.body.avatarUrl);

      const current = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${token}`);
      expect(current.body.avatarUrl).toBe(res.body.avatarUrl);
    });

    it('should return 400 when no file is sent', async () => {
      const { token } = await createUser('avatar_nofile');

      const res = await request(app)
        .patch('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(uploadAvatar).not.toHaveBeenCalled();
    });

    it('should return 400 for non-image files', async () => {
      const { token } = await createUser('avatar_type');

      const res = await request(app)
        .patch('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/images are allowed/);
      expect(uploadAvatar).not.toHaveBeenCalled();
    });

    it('should return 400 for files larger than 5 MB', async () => {
      const { token } = await createUser('avatar_size');
      const big = Buffer.alloc(5 * 1024 * 1024 + 1);

      const res = await request(app)
        .patch('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', big, { filename: 'big.png', contentType: 'image/png' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/too large/);
      expect(uploadAvatar).not.toHaveBeenCalled();
    });

    it('should return 502 when Cloudinary upload fails and keep the old avatar', async () => {
      const { email, token } = await createUser('avatar_fail');
      const err = new Error('Avatar upload failed');
      err.status = 502;
      uploadAvatar.mockRejectedValue(err);

      const res = await request(app)
        .patch('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', PNG_1PX, { filename: 'me.png', contentType: 'image/png' });

      expect(res.statusCode).toBe(502);
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.avatarUrl).toBeNull();
    });

    it('should return 401 without a token', async () => {
      const res = await request(app)
        .patch('/api/users/avatar')
        .attach('avatar', PNG_1PX, { filename: 'me.png', contentType: 'image/png' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PATCH /api/users/edit', () => {
    it('should update name and gender and return public fields only', async () => {
      const { email, token } = await createUser('edit_basic');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '  Dmytro  ', gender: 'male' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        email,
        name: 'Dmytro',
        gender: 'male',
        dailyNorma: 2000,
        avatarUrl: null,
      });
    });

    it('should clear the name when an empty string is sent', async () => {
      const { token } = await createUser('edit_clear');
      await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Temp' });

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBeNull();
    });

    it('should return 400 for name longer than 32 characters', async () => {
      const { token } = await createUser('edit_longname');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(33) });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid gender', async () => {
      const { token } = await createUser('edit_gender');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ gender: 'other' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for an empty body', async () => {
      const { token } = await createUser('edit_empty');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('At least one field must be provided');
    });

    it('should change email (normalized) and allow sign in with it', async () => {
      const { password, token } = await createUser('edit_email');
      const newEmail = generateEmail('edit_email_new');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: `  ${newEmail.toUpperCase()}  ` });

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(newEmail);

      const signin = await request(app).post('/api/auth/signin').send({ email: newEmail, password });
      expect(signin.statusCode).toBe(200);
    });

    it('should accept the user\'s own current email', async () => {
      const { email, token } = await createUser('edit_same_email');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ email });

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(email);
    });

    it('should return 409 "Email in use" when email belongs to another user', async () => {
      const other = await createUser('edit_taken_other');
      const { token } = await createUser('edit_taken');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: other.email });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'Email in use');
    });

    it('should change password when oldPassword is correct', async () => {
      const { email, password, token } = await createUser('edit_pw');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: password, password: 'newpassword456' });

      expect(res.statusCode).toBe(200);

      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(await bcrypt.compare('newpassword456', userInDb.password)).toBe(true);

      const oldLogin = await request(app).post('/api/auth/signin').send({ email, password });
      expect(oldLogin.statusCode).toBe(401);
      const newLogin = await request(app)
        .post('/api/auth/signin')
        .send({ email, password: 'newpassword456' });
      expect(newLogin.statusCode).toBe(200);
    });

    it('should keep the current session valid after a password change', async () => {
      const { password, token } = await createUser('edit_pw_session');

      await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: password, password: 'newpassword456' });

      const current = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${token}`);
      expect(current.statusCode).toBe(200);
    });

    it('should return 400 (not 401) when oldPassword is wrong', async () => {
      const { email, password, token } = await createUser('edit_pw_wrong');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'wrongpassword', password: 'newpassword456' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Outdated password is wrong');

      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(await bcrypt.compare(password, userInDb.password)).toBe(true);
    });

    it('should return 400 when only one of the password fields is sent', async () => {
      const { password, token } = await createUser('edit_pw_half');

      const res1 = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newpassword456' });
      expect(res1.statusCode).toBe(400);

      const res2 = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: password });
      expect(res2.statusCode).toBe(400);
    });

    it('should return 400 for new password shorter than 8 or longer than 64 characters', async () => {
      const { password, token } = await createUser('edit_pw_len');

      const short = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: password, password: 'short' });
      expect(short.statusCode).toBe(400);

      const long = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: password, password: 'x'.repeat(65) });
      expect(long.statusCode).toBe(400);
    });

    it('should ignore fields that are not editable (dailyNorma, avatarUrl, token)', async () => {
      const { email, token } = await createUser('edit_strip');

      const res = await request(app)
        .patch('/api/users/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ok', dailyNorma: 1, avatarUrl: 'http://evil', token: 'x' });

      expect(res.statusCode).toBe(200);
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb.dailyNorma).toBe(2000);
      expect(userInDb.avatarUrl).toBeNull();
      expect(userInDb.token).toBe(token);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).patch('/api/users/edit').send({ name: 'x' });
      expect(res.statusCode).toBe(401);
    });
  });
});
