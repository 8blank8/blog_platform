import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepositoryTypeorm } from '@blog/repository/typeorm/blog.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { DeleteBlogCommand } from './delete.blog.use.case';
import { ForbiddenException } from '@nestjs/common';


@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
    constructor(
        private blogRepository: BlogRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm
    ) { }

    async execute(command: DeleteBlogCommand): Promise<boolean> {
        const { id, userId } = command;

        const blog = await this.blogQueryRepository.findFullBlogById(id);
        if (!blog) return false;
        if (blog.user.id !== userId) throw new ForbiddenException();

        const isDelete = await this.blogRepository.deleteBlogById(blog.id);
        if (!isDelete) return false;

        return true;
    }
}
