import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { dropDataBase, startTestConfig } from '../utils/start.test.config';
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';

describe('auth', () => {
  let app: INestApplication;
  // const basicAuth = 'Basic YWRtaW46cXdlcnR5';

  beforeAll(async () => {
    app = await startTestConfig();
  });

  it('registration user invalid login', async () => {
    const userDto = createUserDto(1);

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ ...userDto, login: '' })
      .expect(400);
  });

  it('registration user invalid email', async () => {
    const userDto = createUserDto(1);

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ ...userDto, email: '' })
      .expect(400);
  });

  const user1 = createUserDto(1);
  it('registration user 204', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send(user1)
      .expect(204);
  });

  it('email-resending invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: 'asda' })
      .expect(400);
  });

  it('email-resending no content', async () => {
    const user2 = createUserDto(2);

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send(user2)
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: user2.email })
      .expect(204);
  });

  it('login user invalid login 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: '', password: user1.password })
      .expect(401);
  });

  it('login user invalid password 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user1.login, password: '' })
      .expect(401);
  });

  it('login user ok', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user1.login, password: user1.password })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  it('refresh token unauthorized', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').expect(401);
  });

  it('refresh token ok', async () => {
    const user3 = createUserDto(4);

    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', AUTH.BASIC)
      .send(user3)
      .then(({ body }) => {
        expect(body).toEqual({
          id: expect.any(String),
          login: user3.login,
          email: user3.email,
          createdAt: expect.any(String),
        });
      });

    let loginedUser;

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user1.login, password: user1.password })
      .expect(200)
      .then(({ body, headers }) => {
        loginedUser = headers['set-cookie'][0];

        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });

    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', loginedUser)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  it('delete all data 204', async () => {
    await dropDataBase(app);
  });

  it('get me 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('get me 200', async () => {
    const user1 = createUserDto(1);

    let createdUser1;

    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', AUTH.BASIC)
      .send(user1)
      .then(({ body }) => {
        createdUser1 = body;

        expect(body).toEqual({
          id: expect.any(String),
          login: user1.login,
          email: user1.email,
          createdAt: expect.any(String),
        });
      });

    let loginedUserAccessToken;

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user1.login, password: user1.password })
      .expect(200)
      .then(({ body }) => {
        loginedUserAccessToken = body.accessToken;

        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginedUserAccessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          email: createdUser1.email,
          login: createdUser1.login,
          userId: createdUser1.id,
        });
      });
  });

  describe('logout user', () => {
    it('logout user 401', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('logout user 204', async () => {
      const user2 = createUserDto(2);
      let loginedUserRefreshToken;

      await request(app.getHttpServer())
        .post('/sa/users')
        .set('Authorization', AUTH.BASIC)
        .send(user2)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            login: user2.login,
            email: user2.email,
            createdAt: expect.any(String),
          });
        });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: user1.login, password: user1.password })
        .expect(200)
        .then(({ body, headers }) => {
          loginedUserRefreshToken = headers['set-cookie'][0];

          expect(body).toEqual({
            accessToken: expect.any(String),
          });
        });

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', loginedUserRefreshToken)
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', loginedUserRefreshToken)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
