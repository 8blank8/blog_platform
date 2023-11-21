import { BlogCreateType } from "@blog/models/blog.create.type";
import { PostCreateByIdType } from "@blog/models/post.create.by.id.type";
import { PostUpdateByIdModel } from "@blog/models/post.update.by.id";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { PostViewSqlModel } from "@post/models/post.view.sql.model";
import request from 'supertest'

export class Blog {
    public id: string
    public name: string
    public description: string
    public websiteUrl: string
    public createdAt: string
    public isMembership: boolean
    public posts: Array<PostViewSqlModel>

    constructor() {
        this.id = ''
        this.name = ''
        this.description = ''
        this.websiteUrl = ''
        this.createdAt = ''
        this.isMembership = true
        this.posts = []
    }

    async createBlog_201(app: INestApplication, inputData: BlogCreateType, accessToken: string) {
        const res = await request(app.getHttpServer())
            .post(`/blogger/blogs/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(inputData)

        expect(res.status).toBe(HttpStatus.CREATED)

        const {
            id,
            name,
            description,
            websiteUrl,
            createdAt,
            isMembership } = res.body

        this.id = id
        this.name = name
        this.description = description
        this.websiteUrl = websiteUrl
        this.createdAt = createdAt
        this.isMembership = isMembership
    }

    async updateBlog_204(app: INestApplication, inputData: BlogCreateType, accessToken: string) {
        const res = await request(app.getHttpServer())
            .put(`/blogger/blogs/${this.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(inputData)

        expect(res.status).toBe(HttpStatus.NO_CONTENT)

        this.name = inputData.name
        this.description = inputData.description
        this.websiteUrl = inputData.websiteUrl
    }

    async deleteBlog_204(app: INestApplication, accessToken: string) {
        const res = await request(app.getHttpServer())
            .delete(`/blogger/blogs/${this.id}`)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(res.status).toBe(HttpStatus.NO_CONTENT)
    }

    async createPostByBlogId_201(app: INestApplication, inputData: PostCreateByIdType, accessToken: string) {
        const res = await request(app.getHttpServer())
            .post(`/blogger/blogs/${this.id}/posts`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(inputData)

        expect(res.status).toBe(HttpStatus.CREATED)

        expect(res.body).toEqual({
            id: expect.any(String),
            title: inputData.title,
            shortDescription: inputData.shortDescription,
            content: inputData.content,
            blogId: this.id,
            blogName: this.name,
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None",
                newestLikes: []
            }
        })

        this.posts = [...this.posts, res.body]
    }

    async updatePostByBlogId_204(app: INestApplication, postId: string, inputData: PostUpdateByIdModel, accessToken: string) {
        const res = await request(app.getHttpServer())
            .put(`/blogger/blogs/${this.id}/posts/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(inputData)

        expect(res.status).toBe(HttpStatus.NO_CONTENT)

        const post = this.posts.find(post => post!.id === postId)
        if (!post) return false

        post.title = inputData.title
        post.content = inputData.content
        post.shortDescription = inputData.shortDescription
    }

    async deletePostByBlogId_204(app: INestApplication, postId: string, accessToken: string) {
        const res = await request(app.getHttpServer())
            .delete(`/blogger/blogs/${this.id}/posts/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(res.status).toBe(HttpStatus.NO_CONTENT)

        this.posts = this.posts.filter(post => post!.id !== postId)
    }
}