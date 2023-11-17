import { HttpStatus, INestApplication } from '@nestjs/common';
import { TokenTestModel } from '@src/tests/auth/models/token.test.model';
import { UserTestModel } from '@src/tests/auth/models/user.test.model';
import request from 'supertest';

export const connectionGame = async (
  app: INestApplication,
  user: UserTestModel,
  tokens: TokenTestModel,
  test: 'first' | 'second',
): Promise<string> => {
  const res = await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${tokens.accessToken}`);

  switch (test) {
    case 'first':
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user.id,
            login: user.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });
      break;
    case 'second':
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: expect.any(String),
            login: expect.any(String),
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: user.id,
            login: user.login,
          },
          score: 0,
        },
        questions: expect.any(Array),
        status: 'Active',
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
      break;
  }
  return res.body.id;
};
