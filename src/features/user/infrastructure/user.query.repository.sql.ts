import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";


@Injectable()
export class UserQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findAllUsers() {
        const users = await this.dataSource.query(`
        SELECT * FROM "Users"
        `)

        return users.map(user => {
            return {
                id: user.Id,
                login: user.Login,
                email: user.Email,
                createdAt: user.CreatedAt
            }
        })
    }

    async findUser(userId: string) {
        const user = await this.dataSource.query(`
        SELECT "Id", "Login", "Email", "CreatedAt"
	    FROM public."Users"
	    WHERE "Id" = $1;
        `, [userId])

        return user
    }
}