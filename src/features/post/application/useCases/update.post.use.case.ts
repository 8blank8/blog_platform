import { CommandHandler } from '@nestjs/cqrs';
import { PostUpdateType } from '../../models/post.update.type';
import { PostQueryRepository } from '../../infrastructure/mongo/post.query.repository';
import { PostRepository } from '../../infrastructure/mongo/post.repository';

export class UpdatePostCommand {
  constructor(public id: string, public inputData: PostUpdateType) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase {
  constructor(
    private postQueryRepository: PostQueryRepository,
    private postRepository: PostRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { id, inputData } = command;

    const post = await this.postQueryRepository.findPostDocumentById(id);
    if (!post) return false;

    post.updatePost(inputData);

    await this.postRepository.savePost(post);

    return true;
  }
}
