import { HttpStatus, INestApplication } from '@nestjs/common';
import { AUTH } from '@src/tests/enums/base.auth.enum';
import request from 'supertest';

import { UserTestModel } from '../models/user.test.model';

export const registerUserForSa = async (
  app: INestApplication,
  number: number,
): Promise<UserTestModel> => {
  const userDto = {
    login: `userlogin${number}`,
    email: `email${number}@yandex.ru`,
    password: `password${number}`,
  };
  let user: UserTestModel;

  const res = await request(app.getHttpServer())
    .post(`/sa/users`)
    .set('Authorization', AUTH.BASIC)
    .send(userDto);

  expect(res.status).toBe(HttpStatus.CREATED);

  user = {
    id: res.body.id,
    login: res.body.login,
    email: res.body.email,
    createdAt: res.body.createdAt,
    password: userDto.password,
  };

  return user;
};
