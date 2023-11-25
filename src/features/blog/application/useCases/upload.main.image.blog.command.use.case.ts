import { BlogImage } from "@blog/domain/typeorm/blog.image";
import { BlogQueryRepositoryTypeorm } from "@blog/repository/typeorm/blog.query.repository.typeorm";
import { BlogRepositoryTypeorm } from "@blog/repository/typeorm/blog.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import { FileS3Adapter } from "@utils/adapters/file.s3.adapter";
import { join } from "path";
import sharp from "sharp";


export class UploadMainImageBlogCommand {
    constructor(
        public blogId: string,
        public userId: string,
        public file: Express.Multer.File
    ) { }
}

@CommandHandler(UploadMainImageBlogCommand)
export class UploadMainImageBlogUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private blogRepository: BlogRepositoryTypeorm,
        private fileS3Adapter: FileS3Adapter
    ) { }

    async execute(command: UploadMainImageBlogCommand): Promise<boolean> {
        const { userId, blogId, file } = command

        const blog = await this.blogQueryRepository.findFullBlogById(blogId)
        if (!blog) return false
        if (blog.user.id !== userId) throw new ForbiddenException()

        const validation = await this.validationFile(file)
        if (!validation) return false

        const url = this.createImageUrl(blogId, file.originalname)

        await this.fileS3Adapter.saveImage(blog.id, file.originalname, file.buffer)

        const image = new BlogImage()
        image.blog = blog
        image.fileSize = validation.size
        image.width = validation.width
        image.height = validation.height
        image.title = 'main'
        image.url = url

        await this.blogRepository.saveImage(image)
        return true
    }

    // TODO: перенести логику в utils
    private createImageUrl(blogId: string, originalName: string): string {
        // const imageTitle = `${originalName}.${format}`
        const url = join('content', 'blogs', blogId, 'main', originalName)
        return url
    }

    // TODO: перенести логику в utils
    private async validationFile(file: Express.Multer.File) {
        let size, format, width, height

        try {
            const metadata = await sharp(file.buffer).metadata()
            size = metadata.size
            format = metadata.format
            height = metadata.height,
                width = metadata.width
        } catch (error) {
            console.log(error)
            return false
        }

        if (size > 100000) return false
        if (format !== 'jpg' && format !== 'jpeg' && format !== 'png') return false
        if (width !== 156 && height !== 156) return false

        return {
            width,
            height,
            size,
            format
        }
    }
}