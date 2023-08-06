import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtOrNotGuard extends AuthGuard('jwt') {
    handleRequest(err, user) {
        // Если пользователь на авторизован, то user = null
        return user || { userId: undefined, login: undefined };
    }
}