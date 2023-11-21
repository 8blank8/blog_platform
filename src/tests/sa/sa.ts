import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest'
import { AUTH } from "../enums/base.auth.enum";


export class Sa {
    async bindBlogOtherUser_204(app: INestApplication, userId: string, blogId: string) {
        const res = await request(app.getHttpServer())
            .put(`/sa/blogs/${blogId}/bind-with-user/${userId}`)
            .set('Authorization', AUTH.BASIC)

        expect(res.status).toBe(HttpStatus.NO_CONTENT)
    }
}