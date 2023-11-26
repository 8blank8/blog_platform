import { BlogImage } from "@blog/domain/typeorm/blog.image";
import { BlogQueryRepositoryTypeorm } from "@blog/repository/typeorm/blog.query.repository.typeorm";
import { BlogRepositoryTypeorm } from "@blog/repository/typeorm/blog.repository.typeorm";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import { PostImage } from "@post/domain/typeorm/post.image.entity";
import { PostQueryRepositoryTypeorm } from "@post/repository/typeorm/post.query.repository.typeorm";
import { PostRepositoryTypeorm } from "@post/repository/typeorm/post.repository.typeorm";
import { FileS3Adapter } from "@utils/adapters/file.s3.adapter";
import { join } from "path";
import sharp from "sharp";


export class UploadMainImagePostCommand {
    constructor(
        public blogId: string,
        public postId: string,
        public userId: string,
        public file: Express.Multer.File
    ) { }
}

@CommandHandler(UploadMainImagePostCommand)
export class UploadMainImagePostUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private postQueryRepository: PostQueryRepositoryTypeorm,
        private postRepository: PostRepositoryTypeorm,
        private fileS3Adapter: FileS3Adapter
    ) { }

    async execute(command: UploadMainImagePostCommand): Promise<boolean | string> {
        const { blogId, postId, file, userId } = command

        const blog = await this.blogQueryRepository.findFullBlogById(blogId)
        if (!blog) throw new NotFoundException()
        if (blog.user.id !== userId) throw new ForbiddenException()

        const post = await this.postQueryRepository.findFullPostById(postId)
        if (!post) throw new NotFoundException()

        const validation = await this.validationFile(file)
        if (!validation) return false

        const url = this.createImageUrl(blogId, postId, file.originalname)
        const urlMiddle = this.createImageUrl(blogId, postId, 'middle_' + file.originalname)
        const urlSmall = this.createImageUrl(blogId, postId, 'small_' + file.originalname)

        const middleImage = await this.resizeImage(file, 300, 180)
        const smallImage = await this.resizeImage(file, 149, 96)

        const middleImageMetadata = await this.getMetadataFile(middleImage)
        const smallImageMetadata = await this.getMetadataFile(smallImage)

        if (!middleImageMetadata || !smallImageMetadata) return false

        await this.fileS3Adapter.saveImage(url, file.buffer)
        await this.fileS3Adapter.saveImage(urlMiddle, middleImage)
        await this.fileS3Adapter.saveImage(urlSmall, smallImage)

        const image = new PostImage()
        image.post = post
        image.fileSize = validation.size
        image.height = validation.height
        image.width = validation.width
        image.title = 'main'
        image.url = url

        const newSmallImage = new PostImage()
        newSmallImage.post = post
        newSmallImage.fileSize = smallImageMetadata.size
        newSmallImage.height = smallImageMetadata.height
        newSmallImage.width = smallImageMetadata.width
        newSmallImage.title = 'main'
        newSmallImage.url = urlSmall

        const newMiddleImage = new PostImage()
        newMiddleImage.post = post
        newMiddleImage.fileSize = middleImageMetadata.size
        newMiddleImage.height = middleImageMetadata.height
        newMiddleImage.width = middleImageMetadata.width
        newMiddleImage.title = 'main'
        newMiddleImage.url = urlMiddle

        await this.postRepository.savePostImage(image)
        await this.postRepository.savePostImage(newSmallImage)
        await this.postRepository.savePostImage(newMiddleImage)

        return post.id
    }

    private async resizeImage(file: Express.Multer.File, width: number, height: number) {
        const image = await sharp(file.buffer).resize(width, height).toBuffer()
        return image
    }

    // TODO: перенести логику в utils
    private createImageUrl(blogId: string, postId: string, originalName: string): string {
        // const imageTitle = `${originalName}.${format}`
        const url = `content/blogs/${blogId}/posts/${postId}/main/${originalName}`
        return url
    }

    private async getMetadataFile(file: Buffer) {
        let size, width, height

        try {
            const metadata = await sharp(file.buffer).metadata()
            size = metadata.size
            height = metadata.height,
                width = metadata.width
        } catch (error) {
            console.log(error)
            return false
        }

        return {
            width,
            height,
            size,
        }
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
        if (width !== 940 || height !== 432) return false

        return {
            width,
            height,
            size,
            format
        }
    }
}