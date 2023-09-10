import request from 'supertest';
import { Test } from '@nestjs/testing';
// import { CatsModule } from '../../src/cats/cats.module';
// import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { BlogCreateSqlModel } from '../../features/blog/infrastructure/sql/models/blog.create.sql.model';
import { BlogViewSqlModel } from 'src/features/blog/infrastructure/sql/models/blog.view.sql.model';
import { PostCreateSqlModel } from 'src/features/post/infrastructure/sql/models/post.create.sql.model';





describe('Comments', () => {
    let app: INestApplication;
    const basicAuth: string = 'Basic YWRtaW46cXdlcnR5'

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication();
        await app.init();
    });

    describe('delete all data', () => {
        it('delete all data', async () => {
            await request(app.getHttpServer()).delete('/testing/all-data').expect(204)
        })
    })


    describe('create 6 comments', () => {

        const usersDto = [
            {
                login: 'users1',
                email: 'user1@mail.ru',
                password: 'users1'
            },
            {
                login: 'users2',
                email: 'user2@mail.ru',
                password: 'users2'
            },
            {
                login: 'users3',
                email: 'user3@mail.ru',
                password: 'users3'
            },
            {
                login: 'users4',
                email: 'user4@mail.ru',
                password: 'users4'
            }
        ]
        let tokens: string[] = []

        const comemntsDto = [
            { content: 'comment_1 ajdlkjaskldjlasjldkjalskjdlajsldjslk' },
            { content: 'comment_2 ajdlkjaskldjlasjldkjalskjdlajsldjslk' },
            { content: 'comment_3 ajdlkjaskldjlasjldkjalskjdlajsldjslk' },
            { content: 'comment_4 ajdlkjaskldjlasjldkjalskjdlajsldjslk' },
            { content: 'comment_5 ajdlkjaskldjlasjldkjalskjdlajsldjslk' },
            { content: 'comment_6 ajdlkjaskldjlasjldkjalskjdlajsldjslk' }
        ]
        let createdComments: any = []

        let createdBlog: any = null
        let createdPost: any = null


        const createdBlogDto = {
            name: 'new blog',
            description: 'length_20_123123123123',
            websiteUrl: 'https://some.com'
        }

        it('create blog /sa/blogs', async () => {

            const blog = await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', basicAuth)
                .send(createdBlogDto)
                .expect(201)

            createdBlog = await JSON.parse(blog.text)
        })

        it('find blog /blogs/:id', async () => {
            const blog = await request(app.getHttpServer())
                .get(`/blogs/${createdBlog.id}`)
                .expect(200)

            const blogParse = JSON.parse(blog.text)

            expect(blogParse).toEqual(createdBlog)
        })

        it('create post /sa/blogs/:id/posts', async () => {

            const postDto = {
                title: 'new post',
                shortDescription: 'aahskdjhaskdhiaushadk',
                content: 'abskdbkasbdkjabskdbaksbdkabskdbakjsbdk',
            }

            const post = await request(app.getHttpServer())
                .post(`/sa/blogs/${createdBlog.id}/posts`)
                .set('Authorization', basicAuth)
                .send(postDto)
                .expect(201)

            createdPost = await JSON.parse(post.text)
        })

        it('created 4 user /sa/users', async () => {
            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', basicAuth)
                .send(usersDto[0])
                .expect(201)

            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', basicAuth)
                .send(usersDto[1])
                .expect(201)

            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', basicAuth)
                .send(usersDto[2])
                .expect(201)

            await request(app.getHttpServer())
                .post('/sa/users')
                .set('Authorization', basicAuth)
                .send(usersDto[3])
                .expect(201)
        })

        it('login 4 users /auth/login', async () => {
            for (let i = 0; i < usersDto.length; i++) {
                const loginData = {
                    loginOrEmail: usersDto[i].login,
                    password: usersDto[i].password
                }

                const accessToken = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(loginData)
                    .expect(200)

                tokens.push(JSON.parse(accessToken.text).accessToken)
            }
        })

        it('create 6 comments by user1 /posts/:id/comments', async () => {

            for (let i = 0; i < comemntsDto.length; i++) {

                const comment = await request(app.getHttpServer())
                    .post(`/posts/${createdPost.id}/comments`)
                    .set('Authorization', `Bearer ${tokens[0]}`)
                    .send(comemntsDto[i])
                    .expect(201)

                createdComments.push(JSON.parse(comment.text))
            }
        })

        // it('like comments /posts/:postId/comments', async () => {
        //     await request(app.getHttpServer())
        //         .put(`/posts/:postId/comments`)
        // })
    })

    afterAll(async () => {
        await app.close();
    });
});