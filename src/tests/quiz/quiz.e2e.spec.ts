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
            let questions

            const responseConnection = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)
            // .then(({ body }) => {
            //     questions = body.questions
            //     console.log(questions)
            //     expect(body).toEqual({
            //         id: expect.any(String),
            //         firstPlayerProgress: {
            //             answers: [],
            //             player: {
            //                 id: createdUser1.id,
            //                 login: createdUser1.login
            //             },
            //             score: 0
            //         },
            //         secondPlayerProgress: null,
            //         questions: null,
            //         status: "PendingSecondPlayer",
            //         pairCreatedDate: expect.any(String),
            //         startGameDate: null,
            //         finishGameDate: null
            //     })
            // })
            const responseConnectionUser2 = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)


            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '2' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)



            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            const responseMyCurrent = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            expect(responseMyCurrent.body.firstPlayerProgress.score).toBe(4)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '2' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '2' })
                .expect(200)

            const res = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            const res2 = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)

            expect(res2.body.firstPlayerProgress.score).toBe(5)
            expect(res2.body.secondPlayerProgress.score).toBe(3)

            expect(res.body.firstPlayerProgress.answers).toEqual(res2.body.firstPlayerProgress.answers)
            expect(res.body.secondPlayerProgress.answers).toEqual(res2.body.secondPlayerProgress.answers)


            const statistic = await request(app.getHttpServer())
                .get('/pair-game-quiz/users/my-statistic')
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)


            expect(statistic.body).toEqual({
                sumScore: 5,
                avgScores: 5,
                gamesCount: 1,
                winsCount: 1,
                lossesCount: 0,
                drawsCount: 0
            })
            // const responseMyCurrentUser2 = await request(app.getHttpServer())
            //     .get(`/pair-game-quiz/pairs/my-current`)
            //     .set('Authorization', `Bearer ${accessTokenUser2}`)
            //     .expect(200)

            // console.log({ answer: responseMyCurrent.body.firstPlayerProgress.answers })

            // expect(responseConnectionUser2.body.questions).toEqual(responseMyCurrent.body.questions)
            // expect(responseConnectionUser2.body.questions).toEqual(responseMyCurrentUser2.body.questions)

            // .then(({ body }) => {
            //     expect(body).toEqual({
            //         id: expect.any(String),
            //         firstPlayerProgress: {
            //             answers: [],
            //             player: {
            //                 id: createdUser1.id,
            //                 login: createdUser1.login
            //             },
            //             score: 0
            //         },
            //         secondPlayerProgress: {
            //             answers: [],
            //             player: {
            //                 id: createdUser2.id,
            //                 login: createdUser2.login
            //             },
            //             score: 0
            //         },
            //         questions: expect.any(Array<{ id: String, body: String }>),
            //         status: "Active",
            //         pairCreatedDate: expect.any(String),
            //         startGameDate: expect.any(String),
            //         finishGameDate: null
            //     })



        })

        it('connection games 2', async () => {
            const responseConnection = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            const responseConnectionUser2 = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)


            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '2' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)



            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            const responseMyCurrent = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            expect(responseMyCurrent.body.firstPlayerProgress.score).toBe(4)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '2' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '2' })
                .expect(200)

            const res = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            const res2 = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)

            expect(res2.body.firstPlayerProgress.score).toBe(5)
            expect(res2.body.secondPlayerProgress.score).toBe(3)

            expect(res.body.firstPlayerProgress.answers).toEqual(res2.body.firstPlayerProgress.answers)
            expect(res.body.secondPlayerProgress.answers).toEqual(res2.body.secondPlayerProgress.answers)


            const statistic = await request(app.getHttpServer())
                .get('/pair-game-quiz/users/my-statistic')
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)


            expect(statistic.body).toEqual({
                sumScore: 10,
                avgScores: 5,
                gamesCount: 2,
                winsCount: 2,
                lossesCount: 0,
                drawsCount: 0
            })
        })

        it('connection games 2', async () => {
            const responseConnection = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            const responseConnectionUser2 = await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/connection`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)


            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)



            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .send({ answer: '1' })
                .expect(200)

            const responseMyCurrent = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/my-current`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            expect(responseMyCurrent.body.firstPlayerProgress.score).toBe(5)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            await request(app.getHttpServer())
                .post(`/pair-game-quiz/pairs/my-current/answers`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .send({ answer: '1' })
                .expect(200)

            const res = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)

            const res2 = await request(app.getHttpServer())
                .get(`/pair-game-quiz/pairs/${responseConnection.body.id}`)
                .set('Authorization', `Bearer ${accessTokenUser2}`)
                .expect(200)

            expect(res2.body.firstPlayerProgress.score).toBe(6)
            expect(res2.body.secondPlayerProgress.score).toBe(5)

            expect(res.body.firstPlayerProgress.answers).toEqual(res2.body.firstPlayerProgress.answers)
            expect(res.body.secondPlayerProgress.answers).toEqual(res2.body.secondPlayerProgress.answers)


            const statistic = await request(app.getHttpServer())
                .get('/pair-game-quiz/users/my-statistic')
                .set('Authorization', `Bearer ${accessTokenUser1}`)
                .expect(200)


            expect(statistic.body).toEqual({
                sumScore: 15,
                avgScores: 5,
                gamesCount: 3,
                winsCount: 2,
                lossesCount: 0,
                drawsCount: 1
            })
        })

        it('get my games for user1', async () => {
            const res = await request(app.getHttpServer())
                .get('/pair-game-quiz/pairs/my')
                .set('Authorization', `Bearer ${accessTokenUser1}`)

            console.log(res.body.items)
            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.items.length).toBe(3)
        })
    })

    afterAll(async () => {
        await app.close()
    })
})

