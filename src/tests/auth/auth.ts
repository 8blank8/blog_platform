import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest'
import { AUTH } from "../enums/base.auth.enum";


export class Auth {
    public id: string
    public login: string
    public email: string
    public createdAt: string
    public password: string
    public accessToken: string
    public refreshToken: string


    async registrationUser(app: INestApplication, number: number) {
        const userDto = {
            login: `userlogin${number}`,
            email: `email${number}@yandex.ru`,
            password: `password${number}`,
        };

        const res = await request(app.getHttpServer())
            .post(`/sa/users`)
            .set('Authorization', AUTH.BASIC)
            .send(userDto);

        expect(res.status).toBe(HttpStatus.CREATED);

        this.id = res.body.id
        this.login = res.body.login
        this.email = res.body.email
        this.createdAt = res.body.createdAt
        this.password = userDto.password
    }

    async loginUser(app: INestApplication) {

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: this.login, password: this.password });

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toEqual({ accessToken: expect.any(String) });

        this.accessToken = res.body.accessToken
        this.refreshToken = res.headers['set-cookie'][0]
    };

    async loginUserBanned_401(app: INestApplication) {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginOrEmail: this.login, password: this.password });

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    }
}