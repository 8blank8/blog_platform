import { CommandHandler } from "@nestjs/cqrs";
import { PostRepository } from "../../infrastructure/post.repository";


export class DeletePostCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase {
    constructor(
        private postRepository: PostRepository,
    ) { }

    async execute(command: DeletePostCommand) {

        const { id } = command

        return this.postRepository.deletePost(id)
    }
}