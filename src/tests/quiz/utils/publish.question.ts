import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AUTH } from '@src/tests/enums/base.auth.enum';

import { QuestTestModel } from '../models/quest.test.model';

export const publishQuestion = async (
  app: INestApplication,
  question: QuestTestModel,
  publish = true,
) => {
  const res = await request(app.getHttpServer())
    .put(`/sa/quiz/questions/${question.id}/publish`)
    .set('Authorization', AUTH.BASIC)
    .send({ published: publish });

  expect(res.status).toBe(HttpStatus.NO_CONTENT);
};
