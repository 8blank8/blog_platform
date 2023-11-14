import { CommandHandler } from '@nestjs/cqrs';
import { UpdatePublishedQuestModel } from '@quiz/models/update.published.quest.model';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';

export class UpdatePublishedQuestCommand {
  constructor(public id: string, public inputData: UpdatePublishedQuestModel) {}
}

@CommandHandler(UpdatePublishedQuestCommand)
export class UpdatePublishedQuestUseCase {
  constructor(
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
    private quizRepository: QuizRepositoryTypeorm,
  ) {}

  async execute(command: UpdatePublishedQuestCommand): Promise<boolean> {
    const { id, inputData } = command;

    const quest = await this.quizQueryRepository.findQuestById(id);
    if (!quest) return false;

    quest.published = inputData.published;
    quest.updatedAt = new Date().toISOString();

    await this.quizRepository.saveQuest(quest);
    return true;
  }
}
