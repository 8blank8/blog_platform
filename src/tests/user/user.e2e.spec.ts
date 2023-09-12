import request from 'supertest';
import { startTestConfig } from '../utils/start.test.config';
import { INestApplication } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';

describe('users', () => {
    let app: INestApplication


    beforeAll(async () => {
        app = await startTestConfig()
    });


    it('create user not validation email 400', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send({ ...userDto, email: 'user1' })
            .expect(400)
    })

    it('create user not validation login 400', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send({ ...userDto, login: '' })
            .expect(400)
    })

    it('create user unauthorized 401', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/sa/users')
            .send(userDto)
            .expect(401)
    })

    it('create user', async () => {

        const userDto = createUserDto(1)

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send(userDto)
            .then(({ body }) => {
                expect(body).toEqual({
                    id: expect.any(String),
                    login: userDto.login,
                    email: userDto.email,
                    createdAt: expect.any(String)
                })

            })
    })

    it('get users', async () => {

        const userDto = createUserDto(2)

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send(userDto)
            .then(({ body }) => {
                expect(body).toEqual({
                    id: expect.any(String),
                    login: userDto.login,
                    email: userDto.email,
                    createdAt: expect.any(String)
                })

            })

        await request(app.getHttpServer())
            .get('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .expect(200)
            .then(({ body }) => {
                expect(body).toEqual({
                    pagesCount: expect.any(Number),
                    page: expect.any(Number),
                    pageSize: expect.any(Number),
                    totalCount: expect.any(Number),
                    items: expect.any(Array<{
                        id: string,
                        login: string,
                        email: string,
                        createdAt: string
                    }>)
                })
            })
    })

    it('get users queryParam pagesize and pageNumber', async () => {

        await request(app.getHttpServer())
            .get('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .query({ pageSize: 1, pageNumber: 2 })
            .expect(200)
            .then(({ body }) => {
                expect(body.items.length).toBe(1)
            })

    })

    it('delete user by id unautorized 401', async () => {

        const userDto = createUserDto(3)
        let createdUser

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send(userDto)
            .then(({ body }) => {
                createdUser = body
                expect(body).toEqual({
                    id: expect.any(String),
                    login: userDto.login,
                    email: userDto.email,
                    createdAt: expect.any(String)
                })

            })

        await request(app.getHttpServer())
            .delete(`/sa/users/${createdUser.id}`)
            .expect(401)
    })

    it('delete user by id not found 404', async () => {

        await request(app.getHttpServer())
            .delete(`/sa/users/${uuidv4()}`)
            .set('Authorization', AUTH.BASIC)
            .expect(404)
    })

    it('delete user by id no content 204', async () => {

        const userDto = createUserDto(4)
        let createdUser

        await request(app.getHttpServer())
            .post('/sa/users')
            .set('Authorization', AUTH.BASIC)
            .send(userDto)
            .then(({ body }) => {
                createdUser = body
                expect(body).toEqual({
                    id: expect.any(String),
                    login: userDto.login,
                    email: userDto.email,
                    createdAt: expect.any(String)
                })

            })

        await request(app.getHttpServer())
            .delete(`/sa/users/${createdUser.id}`)
            .set('Authorization', AUTH.BASIC)
            .expect(204)
    })



    // it('get user by id', async () => {

    //     const userDto = createUserDto(3)
    //     let createdUser

    //     await request(app.getHttpServer())
    //         .post('/sa/users')
    //         .set('Authorization', basicAuth)
    //         .send(userDto)
    //         .expect(201)
    //         .then(({ body }) => {
    //             createdUser = body
    //             expect(body).toEqual({
    //                 id: expect.any(String),
    //                 login: userDto.login,
    //                 email: userDto.email,
    //                 createdAt: expect.any(String)
    //             })

    //         })

    //     await request(app.getHttpServer())
    //         .get(`/sa/users/${createdUser.id}`)
    //         .set('Authorization', basicAuth)
    //         .expect(200)
    //         .then(({ body }) => {
    //             expect(body).toEqual({
    //                 id: createdUser.id,
    //                 login: createdUser.login,
    //                 email: createdUser.email,
    //                 createdAt: createdUser.createdAt
    //             })
    //         })
    // })


    afterAll(async () => {
        await app.close();
    });
})

