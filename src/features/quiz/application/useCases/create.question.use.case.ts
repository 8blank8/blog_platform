import { CommandHandler } from '@nestjs/cqrs';
import { CreateQuestionModel } from '../../models/create.question.model';
import { QuizQestion } from '../../domain/typeorm/question.entity';
import { QuizRepositoryTypeorm } from '../../infrastructure/typeorm/quiz.repository.typeorm';

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
