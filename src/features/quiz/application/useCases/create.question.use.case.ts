import { CommandHandler } from '@nestjs/cqrs';
import { QuizQestion } from '@quiz/domain/typeorm/question.entity';
import { CreateQuestionModel } from '@quiz/models/create.question.model';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';

export class CreateQuestionCommand {
  constructor(public inputData: CreateQuestionModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase {
  constructor(private quizRepository: QuizRepositoryTypeorm) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const { inputData } = command;

    const quest = new QuizQestion();
    quest.body = inputData.body;
    quest.correctAnswers = inputData.correctAnswers;

    await this.quizRepository.saveQuest(quest);

    return quest.id;
  }
}
