import { CommandHandler } from '@nestjs/cqrs';
import { CreateQuestionModel } from '@quiz/models/create.question.model';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';

export class UpdateQuestionCommand {
  constructor(public id: string, public inputData: CreateQuestionModel) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase {
  constructor(
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
    private quizRepository: QuizRepositoryTypeorm,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<boolean> {
    const { id, inputData } = command;

    const quest = await this.quizQueryRepository.findQuestById(id);
    if (!quest) return false;

    quest.body = inputData.body;
    quest.correctAnswers = inputData.correctAnswers;
    quest.updatedAt = new Date().toISOString();

    await this.quizRepository.saveQuest(quest);
    return true;
  }
}
