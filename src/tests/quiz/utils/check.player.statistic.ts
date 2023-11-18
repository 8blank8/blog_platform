import { HttpStatus, INestApplication } from '@nestjs/common'
import { TokenTestModel } from '@src/tests/auth/models/token.test.model'
import request from 'supertest'
import { PlayerStatisticModel } from '../models/player.statistic.model'


export const checkPlayerStatistic = async (app: INestApplication, tokens: TokenTestModel, statistic: PlayerStatisticModel) => {
    const res = await request(app.getHttpServer())
        .get(`/pair-game-quiz/users/my-statistic`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
    console.log(res.body)
    expect(res.status).toBe(HttpStatus.OK)
    expect(res.body).toEqual(statistic)
}