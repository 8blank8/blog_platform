import { HttpStatus, INestApplication } from "@nestjs/common";
import { startTestConfig } from "../utils/start.test.config";
import { createUserDto } from "../utils/create.user.dto";
import request from "supertest";
import { AUTH } from "../enums/base.auth.enum";


describe('quiz', () => {
    let app: INestApplication
    jest.setTimeout(20000)

    let createdQuestions: any = []
    beforeAll(async () => {
        app = await startTestConfig()
    });

    describe('delete-all-data', () => {
        it('delete all data', async () => {
            await request(app.getHttpServer()).delete('/testing/all-data')
        })
    })

    // describe('add question', () => {


    // })

    describe('connection game', () => {
        const user1 = createUserDto(1)
        const user2 = createUserDto(2)
        const user3 = createUserDto(3)

        let createdUser1
        let createdUser2
        let createdUser3

        let accessTokenUser1: string
        let accessTokenUser2: string
        let accessTokenUser3: string

        const questions = [
            { body: '11111111111', correctAnswers: ['1'] },
            { body: '22222222222', correctAnswers: ['1'] },
            { body: '33333333333', correctAnswers: ['1'] },
            { body: '44444444444', correctAnswers: ['1'] },
            { body: '55555555555', correctAnswers: ['1'] }
        ]

        let createdGameActive

        let answer1User1

        it('add five question', async () => {

            for (let i = 0; i < questions.length; i++) {
                await request(app.getHttpServer())
                    .post(`/sa/quiz/questions`)
                    .set('Authorization', AUTH.BASIC)
                    .send(questions[i])
                    .expect(201)
                    .then(({ body }) => {
                        createdQuestions.push(body)

                        expect(body).toEqual({
                            id: expect.any(String),
                            body: questions[i].body,
                            correctAnswers: questions[i].correctAnswers,
                            published: false,
                            createdAt: expect.any(String),
                            updatedAt: null
                        })
                    })
            }
        })

        it('published five question', async () => {

            for (let i = 0; i < createdQuestions.length; i++) {
                await request(app.getHttpServer())
                    .put(`/sa/quiz/questions/${createdQuestions[i].id}/publish`)
                    .set('Authorization', AUTH.BASIC)
                    .send({ published: true })
                    .expect(204)
            }
        })

        it('create user1', async () => {
            await request(app.getHttpServer())
                .post(`/sa/users`)
                .set('Authorization', AUTH.BASIC)
                .send(user1)
                .expect(201)
                .then(({ body }) => {
                    createdUser1 = body
                })
        })

        it('create user2', async () => {
            await request(app.getHttpServer())
                .post(`/sa/users`)
                .set('Authorization', AUTH.BASIC)
                .send(user2)
                .expect(201)
                .then(({ body }) => {
                    createdUser2 = body
                })
        })

        it('create user3', async () => {
            await request(app.getHttpServer())
                .post(`/sa/users`)
                .set('Authorization', AUTH.BASIC)
                .send(user3)
                .expect(201)
                .then(({ body }) => {
                    createdUser3 = body
                })
        })

        it('login user1', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ loginOrEmail: user1.login, password: user1.password })
                .expect(200)
                .then(({ body }) => {
                    accessTokenUser1 = body.accessToken

                    expect(body).toEqual({
                        accessToken: expect.any(String)
                    })
                })
        })

        it('login user2', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ loginOrEmail: user2.login, password: user2.password })
                .expect(200)
                .then(({ body }) => {
                    accessTokenUser2 = body.accessToken

                    expect(body).toEqual({
                        accessToken: expect.any(String)
                    })
                })
        })

        it('login user3', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ loginOrEmail: user3.login, password: user3.password })
                .expect(200)
                .then(({ body }) => {
                    accessTokenUser3 = body.accessToken

                    expect(body).toEqual({
                        accessToken: expect.any(String)
                    })
                })
        })

        it('user1 connection game', async () => {
            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 0
                        },
                        secondPlayerProgress: null,
                        questions: null,
                        status: "PendingSecondPlayer",
                        pairCreatedDate: expect.any(String),
                        startGameDate: null,
                        finishGameDate: null
                    })
                })
        })

        it('user2 connection game', async () => {
            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)
                .then(({ body }) => {
                    createdGameActive = body

                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 0
                        },
                        secondPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser2.id,
                                login: createdUser2.login
                            },
                            score: 0
                        },
                        questions: expect.any(Array<{ id: String, body: String }>),
                        status: "Active",
                        pairCreatedDate: expect.any(String),
                        startGameDate: expect.any(String),
                        finishGameDate: null
                    })
                })
        })

        it('get quiz game by id', async () => {
            await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${createdGameActive.id}`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 0
                        },
                        secondPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser2.id,
                                login: createdUser2.login
                            },
                            score: 0
                        },
                        questions: expect.any(Array<{ id: String, body: String }>),
                        status: "Active",
                        pairCreatedDate: expect.any(String),
                        startGameDate: expect.any(String),
                        finishGameDate: null
                    })
                })
        })

        it('get my current game user1', async () => {
            await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 0
                        },
                        secondPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser2.id,
                                login: createdUser2.login
                            },
                            score: 0
                        },
                        questions: expect.any(Array<{ id: String, body: String }>),
                        status: "Active",
                        pairCreatedDate: expect.any(String),
                        startGameDate: expect.any(String),
                        finishGameDate: null
                    })
                })
        })

        it('user1 response 1 answer', async () => {
            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)
                .then(({ body }) => {

                    answer1User1 = body

                    expect(body).toEqual({
                        questionId: expect.any(String),
                        answerStatus: "Correct",
                        addedAt: expect.any(String)
                    })
                })
        })

        it('user3 response answer game user1', async () => {
            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser3}`)
                .send({ answer: '1' })
                .expect(403)
        })

        it('get my current game user1 correct answer and score: 1', async () => {
            await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: [answer1User1],
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 1
                        },
                        secondPlayerProgress: {
                            answers: [],
                            player: {
                                id: createdUser2.id,
                                login: createdUser2.login
                            },
                            score: 0
                        },
                        questions: expect.any(Array<{ id: String, body: String }>),
                        status: "Active",
                        pairCreatedDate: expect.any(String),
                        startGameDate: expect.any(String),
                        finishGameDate: null
                    })
                })
        })

        it('response answer all and finish game', async () => {
            for (let i = 1; i < 5; i++) {
                await request(app.getHttpServer())
                    .post(`/pair-game-quiz/pairs/my-current/answers`)
                    .set('Authorization', `Bearer ${accessTokenUser1}`)
                    .send({ answer: '1' })
                    .expect(200)
                    .then(({ body }) => {
                        expect(body).toEqual({
                            questionId: expect.any(String),
                            answerStatus: "Correct",
                            addedAt: expect.any(String)
                        })
                    })
            }

            for (let i = 0; i < 5; i++) {
                await request(app.getHttpServer())
                    .post(`/pair-game-quiz/pairs/my-current/answers`)
                    .set('Authorization', `Bearer ${accessTokenUser2}`)
                    .send({ answer: '1' })
                    .expect(200)
                    .then(({ body }) => {
                        expect(body).toEqual({
                            questionId: expect.any(String),
                            answerStatus: "Correct",
                            addedAt: expect.any(String)
                        })
                    })
            }

        })

        it('get quiz game user1 by id, should be finish game and add bonus score ', async () => {
            await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${createdGameActive.id}`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        firstPlayerProgress: {
                            answers: expect.any(Array<{
                                questionId: String,
                                answerStatus: "Correct",
                                addedAt: String
                            }>),
                            player: {
                                id: createdUser1.id,
                                login: createdUser1.login
                            },
                            score: 6
                        },
                        secondPlayerProgress: {
                            answers: expect.any(Array<{
                                questionId: String,
                                answerStatus: "Correct",
                                addedAt: String
                            }>),
                            player: {
                                id: createdUser2.id,
                                login: createdUser2.login
                            },
                            score: 5
                        },
                        questions: expect.any(Array<{ id: String, body: String }>),
                        status: "Active",
                        pairCreatedDate: expect.any(String),
                        startGameDate: expect.any(String),
                        finishGameDate: expect.any(String)
                    })
                })
        })

        it('get my current game user1 should be 404', async () => {
            await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(404)

        })
    })

    // describe('delete-all', () => {
    //     it('delete all data', async () => {
    //         await request(app.getHttpServer()).delete('/testing/all-data')
    //     })
    // })

    // describe('game',()=> {

    //     const user5 = createUserDto(5)
    //     let accessTokenUser5: string
    //     let createdUser5

    //     const user6 = createUserDto(6)
    //     let accessTokenUser6: string
    //     let createdUser6

    //     let createdGameActive

    //     it('create user 5', async ()=> {
    //         const res = await request(app.getHttpServer())
    //             .post('/sa/users')
    //             .set('Authorization', AUTH.BASIC)
    //             .send(user5)
            
    //             expect(res.status).toBe(HttpStatus.CREATED)

    //             createdUser5 = res.body
    //     })

    //     it('login user 5', async ()=> {
    //         const res = await request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({loginOrEmail: user5.login, password: user5.password})
            
    //             expect(res.status).toBe(HttpStatus.OK)
    //             expect(res.body).toEqual({
    //                 accessToken: expect.any(String)
    //             })

    //             accessTokenUser5 = res.body.accessToken
    //     })

    //     it('create user 6', async ()=> {
    //         const res = await request(app.getHttpServer())
    //             .post('/sa/users')
    //             .set('Authorization', AUTH.BASIC)
    //             .send(user6)
            
    //             expect(res.status).toBe(HttpStatus.CREATED)

    //             createdUser6 = res.body
    //     })

    //     it('login user 6', async ()=> {
    //         const res = await request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({loginOrEmail: user6.login, password: user6.password})
            
    //             expect(res.status).toBe(HttpStatus.OK)
    //             expect(res.body).toEqual({
    //                 accessToken: expect.any(String)
    //             })

    //             accessTokenUser6 = res.body.accessToken
    //     })

    //     it('connect user5 to game', async () => {
    //         await request(app.getHttpServer())
    //             .post(`/pair-game-quiz/pairs/connection`)
    //             .set('Authorization', `Bearer ${accessTokenUser5}`)
    //             .expect(200)
    //             .then(({ body }) => {
    //                 expect(body).toEqual({
    //                     id: expect.any(String),
    //                     firstPlayerProgress: {
    //                         answers: [],
    //                         player: {
    //                             id: createdUser5.id,
    //                             login: createdUser5.login
    //                         },
    //                         score: 0
    //                     },
    //                     secondPlayerProgress: null,
    //                     questions: null,
    //                     status: "PendingSecondPlayer",
    //                     pairCreatedDate: expect.any(String),
    //                     startGameDate: null,
    //                     finishGameDate: null
    //                 })
    //             })
    //     })

    //     it('user6 connection game', async () => {
    //         await request(app.getHttpServer())
    //             .post(`/pair-game-quiz/pairs/connection`)
    //             .set('Authorization', `Bearer ${accessTokenUser6}`)
    //             .expect(200)
    //             .then(({ body }) => {
    //                 createdGameActive = body
    //                 expect(body).toEqual({
    //                     id: expect.any(String),
    //                     firstPlayerProgress: {
    //                         answers: [],
    //                         player: {
    //                             id: createdUser5.id,
    //                             login: createdUser5.login
    //                         },
    //                         score: 0
    //                     },
    //                     secondPlayerProgress: {
    //                         answers: [],
    //                         player: {
    //                             id: createdUser6.id,
    //                             login: createdUser6.login
    //                         },
    //                         score: 0
    //                     },
    //                     questions: expect.any(Array<{ id: String, body: String }>),
    //                     status: "Active",
    //                     pairCreatedDate: expect.any(String),
    //                     startGameDate: expect.any(String),
    //                     finishGameDate: null
    //                 })
    //             })
    //     })

    //     it('user5 response correct answer 1', async () => {
    //         await request(app.getHttpServer())
    //             .post(`/pair-game-quiz/pairs/my-current/answers`)
    //             .set('Authorization', `Bearer ${accessTokenUser5}`)
    //             .send({ answer: '1' })
    //             .expect(200)
    //             .then(({ body }) => {

    //                 // answer1User1 = body
    //                 expect(body).toEqual({
    //                     questionId: expect.any(String),
    //                     answerStatus: "Correct",
    //                     addedAt: expect.any(String)
    //                 })
    //             })
    //     })

    //     it('user5 response correct answer 1', async () => {
    //         await request(app.getHttpServer())
    //             .post(`/pair-game-quiz/pairs/my-current/answers`)
    //             .set('Authorization', `Bearer ${accessTokenUser5}`)
    //             .send({ answer: '1' })
    //             .expect(200)
    //             .then(({ body }) => {

    //                 // answer1User1 = body

    //                 expect(body).toEqual({
    //                     questionId: expect.any(String),
    //                     answerStatus: "Correct",
    //                     addedAt: expect.any(String)
    //                 })
    //             })
    //     })
    // })

    afterAll(async () => {
        await app.close()
    })
})