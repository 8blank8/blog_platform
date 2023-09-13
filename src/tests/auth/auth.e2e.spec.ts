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
    it('registration user 204', async () => {

        await request(app.getHttpServer())
            .post('/auth/registration')
            .send(user1)
            .expect(204)
    })

    it('email-resending invalid email', async () => {
        await request(app.getHttpServer())
            .post('/auth/registration-email-resending')
            .send({ email: 'asda' })
            .expect(400)
    })

    it('email-resending no content', async () => {

        const user2 = createUserDto(2)

        await request(app.getHttpServer())
            .post('/auth/registration')
            .send(user2)
            .expect(204)

        await request(app.getHttpServer())
            .post('/auth/registration-email-resending')
            .send({ email: user2.email })
            .expect(204)
    })

    it('login user invalid login 401', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: '', password: user1.password })
            .expect(401)
    })

    it('login user invalid password 401', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: user1.login, password: '' })
            .expect(401)
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