import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { AnswerCreateModel } from '@quiz/models/create.answer.model';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';
import { Answer } from '@quiz/domain/typeorm/answer.entity';
import { Game } from '@quiz/domain/typeorm/quiz.game';
import { QuizPlayer } from '@quiz/domain/typeorm/quiz.player.entity';

export class AddAnswerCommand {
  constructor(public inputData: AnswerCreateModel, public userId: string) { }
}
// TODO: добавить в packege.json после завершения // "pre-commit": {
//   "run": "lint",
//   "silent": false
// },
@CommandHandler(AddAnswerCommand)
export class AddAnswerUseCase {
  constructor(
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
    private quizRepository: QuizRepositoryTypeorm,
  ) { }

  async execute(command: AddAnswerCommand): Promise<string | boolean> {
    const { inputData, userId } = command;

    const player = await this.quizQueryRepository.findPlayerById(userId);
    if (!player) throw new ForbiddenException();

    const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(
      player.id,
    );
    if (!game) throw new ForbiddenException();
    if (!game.secondPlayer) throw new ForbiddenException();

    const firstPlayerAnswersCount = this.countPlayerAnswers(game, player);
    if (firstPlayerAnswersCount === 5) throw new ForbiddenException();

    const secondPlayerId = this.findSecondPlayerId(game, player);

    const answer = await this.addAnswer(
      game,
      player,
      inputData.answer,
      firstPlayerAnswersCount,
    );
    await this.addScore(game, player, answer);
    // TODO: возможно не надо сейчас сохранять игру
    await this.quizRepository.saveGame(game);

    // TODO: рефактор функции сделать более оптимизированно и добавить проверку на 10 секунд до завершения
    const isFinished = await this.checkFinishGame(player.id);
    if (isFinished) {
      game.finishGameDate = new Date().toISOString();
      game.status = 'Finished';
      await this.quizRepository.saveGame(game);
    }

    // TODO: рефактор сделать более оптимизированно
    await this.checkAddBonus(game.id, player.id, secondPlayerId);

    return answer.id;
  }

  private async addScore(game: Game, player: QuizPlayer, answer: Answer) {
    const score = await this.quizQueryRepository.findPlayerScoreByUserId(
      game.id,
      player.id,
    );

    if (score && answer.answerStatus === 'Correct') {
      score.score += 1;
      player.sumScore += 1;

      await this.quizRepository.savePlayer(player);
      await this.quizRepository.saveScore(score);
    }
  }

  private countPlayerAnswers(game: Game, player: QuizPlayer): number {
    return !game.answer
      ? 0
      : game.answer.filter((answer) => answer.userId === player.id).length;
  }

  private async addAnswer(
    game: Game,
    player: QuizPlayer,
    answer: string,
    answerCount: number,
  ): Promise<Answer> {
    const newAnswer = new Answer();
    newAnswer.gameId = game.id;
    newAnswer.user = player;
    newAnswer.userId = player.id;
    newAnswer.question = game.questions[answerCount];
    newAnswer.questionId = game.questions[answerCount].id;
    newAnswer.addedAt = new Date().toISOString();

    const isCorrectAnswer = game.questions[answerCount].correctAnswers.find(
      (correctAnswer) => correctAnswer === answer,
    );

    isCorrectAnswer
      ? (newAnswer.answerStatus = 'Correct')
      : (newAnswer.answerStatus = 'Incorrect');

    if (game.answer) {
      game.answer = [...game.answer, newAnswer];
    } else {
      game.answer = [newAnswer];
    }

    await this.quizRepository.saveAnswer(newAnswer);

    return newAnswer;
  }

  private findSecondPlayerId(game: Game, player: QuizPlayer) {
    return game.firstPlayer.id === player.id
      ? game.secondPlayer.id
      : game.firstPlayer.id;
  }

  private async checkFinishGame(userId: string) {
    const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(
      userId,
    );
    if (!game) return false;
    return game.answer.length === 10 ? true : false;
  }

  private async checkAddBonus(
    gameId: string,
    firstPlayerId: string,
    secondPlayerId: string,
  ) {
    const game = await this.quizQueryRepository.findFullGameByGameId(gameId);
    if (!game || game.status !== 'Finished') return false;

    const firstPlayer = await this.quizQueryRepository.findPlayerByPlayerId(
      firstPlayerId,
    );
    const secondPlayer = await this.quizQueryRepository.findPlayerByPlayerId(
      secondPlayerId,
    );
    if (!firstPlayer || !secondPlayer) return false;

    const firstPlayerAnswer: any = [];
    const secondPlayerAnswer: any = [];
    let firstPlayerCorrectAnswer = [];
    let secondPlayerCorrectAnser = [];

    game.answer.forEach((item) => {
      if (item.userId === game.firstPlayer.id) {
        firstPlayerAnswer.push(item);
      } else {
        secondPlayerAnswer.push(item);
      }
    });

    firstPlayerAnswer.sort((a, b) => a.addedAt < b.addedAt);
    secondPlayerAnswer.sort((a, b) => a.addedAt < b.addedAt);

    firstPlayerCorrectAnswer = firstPlayerAnswer.filter(
      (item) => item.answerStatus === 'Correct',
    );
    secondPlayerCorrectAnser = secondPlayerAnswer.filter(
      (item) => item.answerStatus === 'Correct',
    );

    if (
      firstPlayerCorrectAnswer.length === 0 &&
      secondPlayerCorrectAnser.length === 0
    )
      return false;

    if (
      firstPlayerAnswer[0].addedAt > secondPlayerAnswer[0].addedAt &&
      firstPlayerCorrectAnswer.length !== 0
    ) {
      const score = await this.quizQueryRepository.findPlayerScoreByUserId(
        game.id,
        firstPlayerId,
      );
      if (!score) return false;

      score.score = score.score + 1;
      firstPlayer.sumScore += 1;

      await this.quizRepository.saveScore(score);
    }
    if (
      secondPlayerAnswer[0].addedAt > firstPlayerAnswer[0].addedAt &&
      secondPlayerCorrectAnser.length !== 0
    ) {
      const score = await this.quizQueryRepository.findPlayerScoreByUserId(
        game.id,
        secondPlayerId,
      );
      if (!score) return false;

      score.score = score.score + 1;
      secondPlayer.sumScore += 1;

      await this.quizRepository.saveScore(score);
    }

    const game1 = await this.quizQueryRepository.findFullGameByGameId(game.id);
    if (!game1) return false;

    let firstPlayerScore;
    let secondPlayerScore;

    game1.score.forEach((item) => {
      if (item.userId === firstPlayer.id) {
        firstPlayerScore = item;
      } else {
        secondPlayerScore = item;
      }
    });

    if (firstPlayerScore.score === secondPlayerScore.score) {
      firstPlayer.drawsCount += 1;
      secondPlayer.drawsCount += 1;

      await this.quizRepository.savePlayer(firstPlayer);
      await this.quizRepository.savePlayer(secondPlayer);
      console.log({ draw: 'its draw' });
      return true;
    }

    if (firstPlayerScore.score > secondPlayerScore.score) {
      firstPlayer.winsCount += 1;
      secondPlayer.lossesCount += 1;
    } else {
      secondPlayer.winsCount += 1;
      firstPlayer.lossesCount += 1;
    }

    firstPlayer.avgScores =
      Math.round((firstPlayer.sumScore / firstPlayer.gamesCount) * 100) / 100;
    secondPlayer.avgScores =
      Math.round((secondPlayer.sumScore / secondPlayer.gamesCount) * 100) / 100;

    await this.quizRepository.savePlayer(firstPlayer);
    await this.quizRepository.savePlayer(secondPlayer);
  }
}
