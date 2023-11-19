import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { dropDataBase, startTestConfig } from '../utils/start.test.config';
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';
import { UserTestModel } from '../auth/models/user.test.model';
import { TokenTestModel } from '../auth/models/token.test.model';
import { addFiveQustions } from './utils/add.five.questions';
import { publishQuestion } from './utils/publish.question';
import { loginUser } from '../auth/utils/login.user';
import { connectionGame } from './utils/connection.game';
import { registerUserForSa } from '../auth/utils/register.user.for.sa';
import { findGameById } from './utils/find.game.by.id';
import { checkPlayerStatistic } from './utils/check.player.statistic';
import { PlayerStatisticModel } from './models/player.statistic.model';
import { async } from 'rxjs';

describe('quiz', () => {
  let app: INestApplication;

  let createdQuestions;
  let user1: UserTestModel;
  let user2: UserTestModel;
  let user3: UserTestModel
  let user4: UserTestModel

  let tokensUser1: TokenTestModel;
  let tokensUser2: TokenTestModel;
  let tokensUser3: TokenTestModel;
  let tokensUser4: TokenTestModel;


  let gameId: string;
  let gameId2: string

  beforeAll(async () => {
    app = await startTestConfig();
  }, 30000);

  describe('delete-all-data', () => {
    it('delete all data', async () => {
      await dropDataBase(app);
    });
  });

  describe('add five question', () => {
    it('add five question status 201', async () => {
      createdQuestions = await addFiveQustions(app);
    });

    it('published questions should be status 204', async () => {
      createdQuestions.forEach(async (quest) => {
        await publishQuestion(app, quest);
      });
    });
  });

  describe('create users', () => {
    it('create user1, user2, user3, user4 should be status 201', async () => {
      user1 = await registerUserForSa(app, 1);
      user2 = await registerUserForSa(app, 2);
      user3 = await registerUserForSa(app, 3);
      user4 = await registerUserForSa(app, 4);
    });

    it('login user1, user2, user3, user4 should be status 200', async () => {
      tokensUser1 = await loginUser(app, {
        login: user1.login,
        password: user1.password,
      });
      tokensUser2 = await loginUser(app, {
        login: user2.login,
        password: user2.password,
      });
      tokensUser3 = await loginUser(app, {
        login: user3.login,
        password: user3.password,
      });
      tokensUser4 = await loginUser(app, {
        login: user4.login,
        password: user4.password,
      });
    });
  });

  describe('connection game user1, user2, and finish game user1 - 6, user2 - 3', () => {
    it('connection game user1 should be status 200', async () => {
      gameId = await connectionGame(app, user1, tokensUser1, 'first');
    });

    it('connection game user2 should be status 200', async () => {
      await connectionGame(app, user2, tokensUser2, 'second');
    });

    it('add 3 correct answer by user2', async () => {
      await addAnswer(app, tokensUser2, '1');
      await addAnswer(app, tokensUser2, '1');
      await addAnswer(app, tokensUser2, '1');
    });

    it('add 5 correct answer by user1', async () => {
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');

      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    it('check result game by user1', async () => {
      console.log('find game ')
      await findGameById(app, gameId, tokensUser1, {
        firsPlayerScore: 6,
        firstPlayerId: user1.id,
        firstPlayerLogin: user1.login,
        secondPlayerScore: 3,
        secondPlayerId: user2.id,
        secondPlayerLogin: user2.login,
      });
    });
    // it('check statistic player user1', async () => {
    //   // await findGameById(app, gameId, tokensUser1, {
    //   //   firsPlayerScore: 6,
    //   //   firstPlayerId: user1.id,
    //   //   firstPlayerLogin: user1.login,
    //   //   secondPlayerScore: 0,
    //   //   secondPlayerId: user2.id,
    //   //   secondPlayerLogin: user2.login,
    //   // });
    //   const statistic: PlayerStatisticModel = {
    //     sumScore: 0,
    //     avgScores: 0,
    //     gamesCount: 1,
    //     winsCount: 0,
    //     lossesCount: 1,
    //     drawsCount: 0
    //   }
    //   await checkPlayerStatistic(app, tokensUser2, statistic)
    // });
  });

  describe('connection game user1, user2, and finish game user1 - 3, user2 - 3', () => {
    it('connection game user1 should be status 200', async () => {
      gameId = await connectionGame(app, user1, tokensUser1, 'first');
    });

    it('connection game user2 should be status 200', async () => {
      await connectionGame(app, user2, tokensUser2, 'second');
    });

    it('add 3 incorrect answer by user2', async () => {
      await addAnswer(app, tokensUser2, '2');
      await addAnswer(app, tokensUser2, '2');
      await addAnswer(app, tokensUser2, '2');
    });

    it('add 3 correct answer by user1', async () => {
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
    });

    it('add 2 correct answer by user2', async () => {
      await addAnswer(app, tokensUser2, '1');
      await addAnswer(app, tokensUser2, '1');
      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    it('check result game by user1', async () => {
      console.log('find game ')
      await findGameById(app, gameId, tokensUser1, {
        firsPlayerScore: 3,
        firstPlayerId: user1.id,
        firstPlayerLogin: user1.login,
        secondPlayerScore: 3,
        secondPlayerId: user2.id,
        secondPlayerLogin: user2.login,
      });
    });
  })

  describe('connection game user1, user2, and finish game user1 - 3, user2 - 3', () => {
    it('connection game user1 should be status 200', async () => {
      gameId = await connectionGame(app, user1, tokensUser1, 'first');
    });

    it('connection game user2 should be status 200', async () => {
      await connectionGame(app, user2, tokensUser2, 'second');
    });

    it('add 3 incorrect answer by user2', async () => {
      await addAnswer(app, tokensUser2, '2');
      await addAnswer(app, tokensUser2, '2');
      await addAnswer(app, tokensUser2, '2');
    });

    it('add 4 correct answer by user1', async () => {
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
      await addAnswer(app, tokensUser1, '1');
    });

    // Create game2 by user3
    it('connection game user3 should be status 200', async () => {
      gameId2 = await connectionGame(app, user3, tokensUser3, 'first');
    });

    //  connect to game by user4.
    it('connection game user4 should be status 200', async () => {
      await connectionGame(app, user4, tokensUser4, 'second');
    });

    // Add 5 correct answers by user3.
    it('add 5 correct answer by user3', async () => {
      await addAnswer(app, tokensUser3, '1');
      await addAnswer(app, tokensUser3, '1');
      await addAnswer(app, tokensUser3, '1');
      await addAnswer(app, tokensUser3, '1');
      await addAnswer(app, tokensUser3, '1');
    });

    // Add 2 correct answers by user4.
    it('add 2 correct answer by user4', async () => {
      await addAnswer(app, tokensUser4, '1');
      await addAnswer(app, tokensUser4, '1');
    });

    // Add 2 correct answers by user2.
    // Await 10 sec.
    it('add 2 correct answer by user2', async () => {
      await addAnswer(app, tokensUser2, '1');
      await addAnswer(app, tokensUser2, '1');
      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    // Get game1 by user2.
    // Should return finished game - status: "Finished", firstPlayerProgress.score: 4, secondPlayerProgress.score: 3,
    // finishGameDate: not to be null.
    it('check result game by user2', async () => {
      console.log('find game ')
      await findGameById(app, gameId, tokensUser2, {
        firsPlayerScore: 4,
        firstPlayerId: user1.id,
        firstPlayerLogin: user1.login,
        secondPlayerScore: 3,
        secondPlayerId: user2.id,
        secondPlayerLogin: user2.login,
      });
    });

    //  Get game2 by user3.
    //  Should return finished game - status: "Finished", firstPlayerProgress.score: 6, secondPlayerProgress.score: 2,
    //  finishGameDate: not to be null.
    it('check result game by user3', async () => {
      console.log('find game ')
      await findGameById(app, gameId2, tokensUser3, {
        firsPlayerScore: 6,
        firstPlayerId: user3.id,
        firstPlayerLogin: user3.login,
        secondPlayerScore: 2,
        secondPlayerId: user4.id,
        secondPlayerLogin: user4.login,
      });
    });
  })

  //   // it('user1 connection game', async () => {
  //   //   const responseConnection = await request(app.getHttpServer())
  //   //     .post(`/pair-game-quiz/pairs/connection`)
  //   //     .set('Authorization', `Bearer ${accessTokenUser1}`)
  //   //     .expect(200);

  //   //   await request(app.getHttpServer())
  //   //     .post(`/pair-game-quiz/pairs/connection`)
  //   //     .set('Authorization', `Bearer ${accessTokenUser2}`)
  //   //     .expect(200);

  //   //   await addAnswer(app, accessTokenUser1, '1');
  //   //   await addAnswer(app, accessTokenUser1, '1');
  //   //   await addAnswer(app, accessTokenUser1, '1');
  //   //   await addAnswer(app, accessTokenUser1, '1');
  //   //   await addAnswer(app, accessTokenUser1, '1');
  //   //   // await addAnswer(app, accessTokenUser2, '1')
  //   //   // await addAnswer(app, accessTokenUser2, '1')
  //   //   // await addAnswer(app, accessTokenUser2, '2')
  //   //   // await addAnswer(app, accessTokenUser2, '2')
  //   //   // await addAnswer(app, accessTokenUser2, '2')

  //   //   const res = await request(app.getHttpServer())
  //   //     .get(`pair-game-quiz/pairs/${responseConnection.body.id}`)
  //   //     .set('Authorization', `Bearer ${accessTokenUser1}`);

  //   //   expect(res.status).toBe(HttpStatus.OK);
  //   //   expect(res.body.finishGameDate).not.toBeNull();

  //   //   const statistic = await request(app.getHttpServer())
  //   //     .get('/pair-game-quiz/users/my-statistic')
  //   //     .set('Authorization', `Bearer ${accessTokenUser1}`)
  //   //     .expect(200);

  //   //   expect(statistic.body).toEqual({
  //   //     sumScore: 6,
  //   //     avgScores: 6,
  //   //     gamesCount: 1,
  //   //     winsCount: 1,
  //   //     lossesCount: 0,
  //   //     drawsCount: 0,
  //   //   });
  //   // });

  //   // it('find top users', async () => {
  //   //   await request(app.getHttpServer())
  //   //     .get('/pair-game-quiz/users/top')
  //   //     .query('sort=avgScores desc');
  //   // });
  // });

  afterAll(async () => {
    await app.close();
  });
});

const addAnswer = async (
  app: INestApplication,
  tokens: TokenTestModel,
  answer = '1',
) => {
  const res = await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/my-current/answers`)
    .set('Authorization', `Bearer ${tokens.accessToken}`)
    .send({ answer: answer });

  expect(res.status).toBe(HttpStatus.OK);
};
