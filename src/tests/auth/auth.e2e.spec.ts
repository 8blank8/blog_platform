import request from 'supertest';
import { INestApplication } from "@nestjs/common";
import { startTestConfig } from "../utils/start.test.config";
import { createUserDto } from '../utils/create.user.dto';

describe('auth', () => {
    let app: INestApplication
    const basicAuth: string = 'Basic YWRtaW46cXdlcnR5'

    beforeAll(async () => {
        app = await startTestConfig()
    });

    it('registration user invalid login', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/auth/registration')
            .send({ ...userDto, login: '' })
            .expect(400)
    })

    it('registration user invalid email', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/auth/registration')
            .send({ ...userDto, email: '' })
            .expect(400)
    })

    const user1 = createUserDto(1)
    it('registration user 201', async () => {

        await request(app.getHttpServer())
            .post('/auth/registration')
            .send(user1)
            .expect(201)
    })

    it('login user invalid login 400', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: '', password: user1.password })
            .expect(400)
    })

    it('login user invalid password 400', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: user1.login, password: '' })
            .expect(400)
    })

    it('login user ok', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: user1.login, password: user1.password })
            .expect(200)
            .then(({ body }) => {
                expect(body).toEqual({
                    accessToken: expect.any(String)
                })
            })
    })


    afterAll(async () => {
        await app.close();
    });
})