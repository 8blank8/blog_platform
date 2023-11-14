import { CommandHandler } from '@nestjs/cqrs';
import { PostLikes } from '@post/domain/typeorm/post.like.entity';
import { PostLikeStatusType } from '@post/models/post.like.status.type';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';

export class UpdateLikeStatusForPostCommand {
  constructor(
    public id: string,
    public inputData: PostLikeStatusType,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateLikeStatusForPostCommand)
export class UpdateLikeStatusForPostUseCase {
  constructor(
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private postRepository: PostRepositoryTypeorm,
  ) {}

  async execute(command: UpdateLikeStatusForPostCommand): Promise<boolean> {
    const { id, inputData, userId } = command;

    const post = await this.postQueryRepository.findFullPostById(id);
    if (!post) return false;

    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    const likeStatus = await this.postQueryRepository.findLikeStatusPost(
      userId,
      id,
    );

    if (inputData.likeStatus === likeStatus?.likeStatus) return true;

    if (!likeStatus) {
      const createdLike = new PostLikes();
      createdLike.likeStatus = inputData.likeStatus;
      createdLike.user = user;
      createdLike.post = post;

      await this.postRepository.savePostLike(createdLike);
      return true;
    } else {
      likeStatus.likeStatus = inputData.likeStatus;
      await this.postRepository.savePostLike(likeStatus);
    }

    return true;
  }
}
