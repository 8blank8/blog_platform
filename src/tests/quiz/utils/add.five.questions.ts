import { HttpStatus, INestApplication } from '@nestjs/common';
import { AUTH } from '@src/tests/enums/base.auth.enum';
import request from 'supertest';

import { QuestTestModel } from '../models/quest.test.model';

export const addFiveQustions = async (
  app: INestApplication,
): Promise<QuestTestModel[]> => {
  const createdQuestions: QuestTestModel[] = [];

  const questions = [
    { body: '11111111111', correctAnswers: ['1'] },
    { body: '22222222222', correctAnswers: ['1'] },
    { body: '33333333333', correctAnswers: ['1'] },
    { body: '44444444444', correctAnswers: ['1'] },
    { body: '55555555555', correctAnswers: ['1'] },
  ];

  for (let i = 0; i < questions.length; i++) {
    const res = await request(app.getHttpServer())
      .post(`/sa/quiz/questions`)
      .set('Authorization', AUTH.BASIC)
      .send(questions[i]);

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({
      id: expect.any(String),
      body: questions[i].body,
      correctAnswers: questions[i].correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: null,
    });

    const quest: QuestTestModel = {
      id: res.body.id,
      body: res.body.body,
      correctAnswers: res.body.correctAnswers,
    };

    createdQuestions.push(quest);
  }

  return createdQuestions;
};
