import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { TokenTestModel } from '../models/token.test.model';

export const loginUser = async (
  app: INestApplication,
  loginData: { login: string; password: string },
): Promise<TokenTestModel> => {
  const { login, password } = loginData;

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ loginOrEmail: login, password: password });

  expect(res.status).toBe(HttpStatus.OK);
  expect(res.body).toEqual({ accessToken: expect.any(String) });

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.headers['set-cookie'][0],
  };
};
