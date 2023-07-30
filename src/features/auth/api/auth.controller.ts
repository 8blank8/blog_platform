import { Body, Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "../application/auth.service";
// import { AuthGuard } from "../guard/auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


@Controller('/auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly userQueryRepository: UserQueryRepository) { }

    @UseGuards(AuthGuard('local'))
    @Post('/login')
    async login(
        @Request() req
    ) {
        return await this.authService.login(req.user)
    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Request() req) {
        console.log(req.user)
        return await this.userQueryRepository.findUserById(req.user.id)
    }
}