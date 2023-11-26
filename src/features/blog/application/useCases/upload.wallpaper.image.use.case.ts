import { BlogImage } from "@blog/domain/typeorm/blog.image";
import { BlogQueryRepositoryTypeorm } from "@blog/repository/typeorm/blog.query.repository.typeorm";
import { BlogRepositoryTypeorm } from "@blog/repository/typeorm/blog.repository.typeorm";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import { FileS3Adapter } from "@utils/adapters/file.s3.adapter";
import { join } from "path";
import sharp from "sharp";


export class UploadWallpaperImageCommand {
    constructor(
        public blogId: string,
        public userId: string,
        public file: Express.Multer.File
    ) { }
}

@CommandHandler(UploadWallpaperImageCommand)
export class UploadWallpaperImageUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private blogRepository: BlogRepositoryTypeorm,
        private fileS3Adapter: FileS3Adapter
    ) { }

    async execute(command: UploadWallpaperImageCommand): Promise<boolean | string> {
        const { blogId, file, userId } = command

        const blog = await this.blogQueryRepository.findFullBlogById(blogId)
        if (!blog) throw new NotFoundException()
        if (blog.user.id !== userId) throw new ForbiddenException()

        const validation = await this.validationFile(file)
        if (!validation) return false

        const url = this.createImageUrl(blogId, file.originalname)

        await this.fileS3Adapter.saveImage(url, file.buffer)

        const image = new BlogImage()
        image.blog = blog
        image.fileSize = validation.size
        image.height = validation.height
        image.width = validation.width
        image.title = 'wallpaper'
        image.url = url

        await this.blogRepository.saveImage(image)


        return blog.id
    }

    // TODO: перенести логику в utils
    private createImageUrl(blogId: string, originalName: string): string {
        // const imageTitle = `${originalName}.${format}`
        const url = `content/blogs/${blogId}/wallpaper/${originalName}`
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
        if (width !== 1028 || height !== 312) return false

        return {
            width,
            height,
            size,
            format
        }
    }
}