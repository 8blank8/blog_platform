import { HttpStatus, INestApplication } from '@nestjs/common';
import { TokenTestModel } from '@src/tests/auth/models/token.test.model';
import request from 'supertest';

class FindGameOptionsModel {
  firsPlayerScore: number;
  firstPlayerId: string;
  firstPlayerLogin: string;
  secondPlayerScore: number;
  secondPlayerId: string;
  secondPlayerLogin: string;
}

export const findGameById = async (
  app: INestApplication,
  gameId: string,
  tokens: TokenTestModel,
  options: FindGameOptionsModel,
) => {
  const res = await request(app.getHttpServer())
    .get(`/pair-game-quiz/pairs/${gameId}`)
    .set('Authorization', `Bearer ${tokens.accessToken}`);

  expect(res.status).toBe(HttpStatus.OK);
  expect(res.body).toEqual({
    id: gameId,
    firstPlayerProgress: {
      answers: expect.any(Array),
      player: {
        id: options.firstPlayerId,
        login: options.firstPlayerLogin,
      },
      score: options.firsPlayerScore,
    },
    secondPlayerProgress: {
      answers: expect.any(Array),
      player: {
        id: options.secondPlayerId,
        login: options.secondPlayerLogin,
      },
      score: options.secondPlayerScore,
    },
    questions: expect.any(Array),
    status: 'Finished',
    pairCreatedDate: expect.any(String),
    startGameDate: expect.any(String),
    finishGameDate: expect.any(String),
  });
};

// {
//     "id": "string",
//     "firstPlayerProgress": {
//       "answers": [
//         {
//           "questionId": "string",
//           "answerStatus": "Correct",
//           "addedAt": "2023-11-17T14:28:37.579Z"
//         }
//       ],
//       "player": {
//         "id": "string",
//         "login": "string"
//       },
//       "score": 0
//     },
//     "secondPlayerProgress": {
//       "answers": [
//         {
//           "questionId": "string",
//           "answerStatus": "Correct",
//           "addedAt": "2023-11-17T14:28:37.579Z"
//         }
//       ],
//       "player": {
//         "id": "string",
//         "login": "string"
//       },
//       "score": 0
//     },
//     "questions": [
//       {
//         "id": "string",
//         "body": "string"
//       }
//     ],
//     "status": "PendingSecondPlayer",
//     "pairCreatedDate": "2023-11-17T14:28:37.579Z",
//     "startGameDate": "2023-11-17T14:28:37.579Z",
//     "finishGameDate": "2023-11-17T14:28:37.579Z"
//   }
