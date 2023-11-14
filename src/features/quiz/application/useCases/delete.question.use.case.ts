import { CommandHandler } from '@nestjs/cqrs';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase {
  constructor(
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
    private quizRepository: QuizRepositoryTypeorm,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<boolean> {
    const { id } = command;

    const quest = await this.quizQueryRepository.findQuestById(id);
    if (!quest) return false;

    await this.quizRepository.deleteQuest(id);
    return true;
  }
}
