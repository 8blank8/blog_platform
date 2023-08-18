import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { BlogCreateModel } from "./models/blog.create.model";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";


@Controller('blogger')
export class BloggerController {

    @UseGuards(JwtAuthGuard)
    @Post('blogs')
    async createBlog(
        @Body() inputData: BlogCreateModel
    ) {

    }
}