import { BasicAuthGuard } from '@auth/guards/basic.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionModel } from '@quiz/models/create.question.model';
import { QuestionQueryParam } from '@quiz/models/question.query.param';
import { UpdatePublishedQuestModel } from '@quiz/models/update.published.quest.model';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { CreateQuestionCommand } from '@quiz/usecases/create.question.use.case';
import { DeleteQuestionCommand } from '@quiz/usecases/delete.question.use.case';
import { UpdatePublishedQuestCommand } from '@quiz/usecases/update.published.quest.use.case';
import { UpdateQuestionCommand } from '@quiz/usecases/update.question.use.case';
import { STATUS_CODE } from '@utils/enum/status.code';
import { Response } from 'express';

@Controller('sa/quiz/questions')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(@Body() inputData: CreateQuestionModel) {
    const questId = await this.commandBus.execute(
      new CreateQuestionCommand(inputData),
    );

    const quest = await this.quizQueryRepository.findQuestById(questId);

    return quest;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteQestion(@Param('id') id: string, @Res() res: Response) {
    const isDeleted = await this.commandBus.execute(
      new DeleteQuestionCommand(id),
    );
    if (!isDeleted) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updateQuestion(
    @Body() inputData: CreateQuestionModel,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const isUpdated = await this.commandBus.execute(
      new UpdateQuestionCommand(id, inputData),
    );
    if (!isUpdated) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id/publish')
  async updatePublisherQuestion(
    @Param('id') id: string,
    @Body() inputData: UpdatePublishedQuestModel,
    @Res() res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdatePublishedQuestCommand(id, inputData),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async findAllQuestion(@Query() queryParam: QuestionQueryParam) {
    const questions = await this.quizQueryRepository.findAllQuestion(
      queryParam,
    );

    return questions;
  }
}
