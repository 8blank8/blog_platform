import { Body, Controller, Get, Post, UseGuards, Request, Res } from "@nestjs/common";
import { Response } from "express";
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
        @Request() req,
        @Res() res: Response
    ) {
        const token = await this.authService.login(req.user)
        res.status(200).send(token)

    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Request() req) {
        console.log(req.user)
        return await this.userQueryRepository.findUserById(req.user.id)
    }
}