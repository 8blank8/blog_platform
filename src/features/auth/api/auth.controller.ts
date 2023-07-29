import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../application/auth.service";


@Controller('/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(@Body() inputData: any) {
        const isLogin = this.authService.validateUser(inputData.loginOrEmail, inputData.password)
        return isLogin
    }
}