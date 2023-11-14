import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { startTestConfig } from '../utils/start.test.config';
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';

describe('quiz', () => {
  let app: INestApplication;
  jest.setTimeout(20000);

  const createdQuestions: any = [];
  beforeAll(async () => {
    app = await startTestConfig();
  });

  describe('delete-all-data', () => {
    it('delete all data', async () => {
      await request(app.getHttpServer()).delete('/testing/all-data');
    });
  });

  describe('connection game', () => {
    const user1 = createUserDto(1);
    const user2 = createUserDto(2);
    const user3 = createUserDto(3);

    let accessTokenUser1: string;
    let accessTokenUser2: string;

    const questions = [
      { body: '11111111111', correctAnswers: ['1'] },
      { body: '22222222222', correctAnswers: ['1'] },
      { body: '33333333333', correctAnswers: ['1'] },
      { body: '44444444444', correctAnswers: ['1'] },
      { body: '55555555555', correctAnswers: ['1'] },
    ];

    it('add five question', async () => {
      for (let i = 0; i < questions.length; i++) {
        await request(app.getHttpServer())
          .post(`/sa/quiz/questions`)
          .set('Authorization', AUTH.BASIC)
          .send(questions[i])
          .expect(201)
          .then(({ body }) => {
            createdQuestions.push(body);

            expect(body).toEqual({
              id: expect.any(String),
              body: questions[i].body,
              correctAnswers: questions[i].correctAnswers,
              published: false,
              createdAt: expect.any(String),
              updatedAt: null,
            });
          });
      }
    });

    it('published five question', async () => {
      for (let i = 0; i < createdQuestions.length; i++) {
        await request(app.getHttpServer())
          .put(`/sa/quiz/questions/${createdQuestions[i].id}/publish`)
          .set('Authorization', AUTH.BASIC)
          .send({ published: true })
          .expect(204);
      }
    });

    it('create user1', async () => {
      await request(app.getHttpServer())
        .post(`/sa/users`)
        .set('Authorization', AUTH.BASIC)
        .send(user1)
        .expect(201);
    });

    it('create user2', async () => {
      await request(app.getHttpServer())
        .post(`/sa/users`)
        .set('Authorization', AUTH.BASIC)
        .send(user2)
        .expect(201);
    });

    it('create user3', async () => {
      await request(app.getHttpServer())
        .post(`/sa/users`)
        .set('Authorization', AUTH.BASIC)
        .send(user3)
        .expect(201);
    });

    it('login user1', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: user1.login, password: user1.password })
        .expect(200)
        .then(({ body }) => {
          accessTokenUser1 = body.accessToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
          });
        });
    });

    it('login user2', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: user2.login, password: user2.password })
        .expect(200)
        .then(({ body }) => {
          accessTokenUser2 = body.accessToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
          });
        });
    });

    it('login user3', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: user3.login, password: user3.password })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            accessToken: expect.any(String),
          });
        });
    });

    it('user1 connection game', async () => {
      const responseConnection = await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(200);

      await addAnswer(app, accessTokenUser1, '1');
      await addAnswer(app, accessTokenUser1, '1');
      await addAnswer(app, accessTokenUser1, '1');
      await addAnswer(app, accessTokenUser1, '1');
      await addAnswer(app, accessTokenUser1, '1');
      setTimeout(async () => {
        // await addAnswer(app, accessTokenUser2, '1')
        // await addAnswer(app, accessTokenUser2, '1')
        // await addAnswer(app, accessTokenUser2, '2')
        // await addAnswer(app, accessTokenUser2, '2')
        // await addAnswer(app, accessTokenUser2, '2')
      }, 10000);

      const res = await request(app.getHttpServer())
        .get(`pair-game-quiz/pairs/${responseConnection.body.id}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.finishGameDate).not.toBeNull();

      const statistic = await request(app.getHttpServer())
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);

      expect(statistic.body).toEqual({
        sumScore: 6,
        avgScores: 6,
        gamesCount: 1,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 0,
      });
    });

    it('find top users', async () => {
      await request(app.getHttpServer())
        .get('/pair-game-quiz/users/top')
        .query('sort=avgScores desc');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

const addAnswer = async (app, token, answer: string) => {
  const res = await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/my-current/answers`)
    .set('Authorization', `Bearer ${token}`)
    .send({ answer: answer })
    .expect(200);

  return res;
};
