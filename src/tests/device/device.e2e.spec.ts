import request from 'supertest'
import { INestApplication } from "@nestjs/common";
import { dropDataBase, startTestConfig } from "../utils/start.test.config";
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';


describe('device', () => {
    let app: INestApplication
    const basicAuth: string = 'Basic YWRtaW46cXdlcnR5'

    beforeAll(async () => {
        app = await startTestConfig()
    });

    beforeEach(async () => {
        await dropDataBase(app)
    })

    describe('get device', () => {

        it('get device 401', async () => {
            await request(app.getHttpServer())
                .get('/security/devices')
                .expect(401)
        })

        it('get device 200', async () => {

            const user1 = createUserDto(1)
            let loginedUserRefreshToken

            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', AUTH.BASIC)
                .send(user1)
                .expect(201)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        login: user1.login,
                        email: user1.email,
                        createdAt: expect.any(String)
                    })
                })

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ loginOrEmail: user1.login, password: user1.password })
                .expect(200)
                .then(({ body, headers }) => {

                    loginedUserRefreshToken = headers['set-cookie'][0]

                    expect(body).toEqual({
                        accessToken: expect.any(String)
                    })
                })

            await request(app.getHttpServer())
                .get('/security/devices')
                .set('Cookie', loginedUserRefreshToken)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual([
                        {
                            ip: expect.any(String),
                            title: expect.any(String),
                            lastActiveDate: expect.any(String),
                            deviceId: expect.any(String)
                        }
                    ])
                })

        })
    })

    describe('delete device', () => {

        it('delete device by id', async () => {
            const user1 = createUserDto(1)
            let loginedUserRefreshToken
            let createdDevice

            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', AUTH.BASIC)
                .send(user1)
                .expect(201)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        login: user1.login,
                        email: user1.email,
                        createdAt: expect.any(String)
                    })
                })

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ loginOrEmail: user1.login, password: user1.password })
                .expect(200)
                .then(({ body, headers }) => {

                    loginedUserRefreshToken = headers['set-cookie'][0]

                    expect(body).toEqual({
                        accessToken: expect.any(String)
                    })
                })

            await request(app.getHttpServer())
                .get('/security/devices')
                .set('Cookie', loginedUserRefreshToken)
                .expect(200)
                .then(({ body }) => {
                    createdDevice = body[0]
                    expect(body).toEqual([
                        {
                            ip: expect.any(String),
                            title: expect.any(String),
                            lastActiveDate: expect.any(String),
                            deviceId: expect.any(String)
                        }
                    ])
                })

            await request(app.getHttpServer())
                .delete(`/security/devices/${createdDevice.deviceId}`)
                .set('Cookie', loginedUserRefreshToken)
                .expect(204)

            await request(app.getHttpServer())
                .get('/security/devices')
                .set('Cookie', loginedUserRefreshToken)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual([])
                })
        })

    })
})
