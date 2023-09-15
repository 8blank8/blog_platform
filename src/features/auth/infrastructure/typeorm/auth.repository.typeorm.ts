import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlackListRefreshToken } from "../../domain/typeorm/auth.entity";
import { Repository } from "typeorm";


@Injectable()
export class AuthRepositoryTypeorm {
    constructor(@InjectRepository(BlackListRefreshToken) private authRepository: Repository<BlackListRefreshToken>) { }

    async saveToken(token: BlackListRefreshToken) {
        return this.authRepository.save(token)
    }

    async findRefreshTokenInBlackList(token: string): Promise<BlackListRefreshToken | null> {
        return this.authRepository.createQueryBuilder('r')
            .where('"refreshToken" = :token', { token })
            .getOne()
    }
}