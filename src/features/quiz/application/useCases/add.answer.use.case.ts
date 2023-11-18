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


    const answer = await this.addAnswer(
      game,
      player,
      inputData.answer,
      firstPlayerAnswersCount,
    );
    await this.addScore(game, player, answer);

    await this.checkFinishGame(game);

    await this.quizRepository.saveGame(game);

    await this.checkExpiresGame(game.id, player.id)


    return answer.id;
  }

  private async addFiledAswers(game: Game, playerId: string) {


    const answerCount = game.answer.filter(answer => answer.userId !== playerId)
    const player = game.firstPlayer.id === playerId ? game.firstPlayer : game.secondPlayer

    if (answerCount.length === 5) return false

    for (let i = answerCount.length; i < 5; i++) {
      await this.addAnswer(game, player, null, i)
      console.log('add failed answer')
    }
  }

  private async checkExpiresGame(gameId: string, playerId: string) {
    const game = await this.quizQueryRepository.findFullGameByGameId(gameId)
    if (!game || !game.answer) return false

    const answers = game.answer.filter(answer => answer.userId === playerId)
    console.log(answers, 'before start timeout')
    if (answers.length === 5) {
      setTimeout(async () => {
        console.log('start timeout')
        await this.addFiledAswers(game, playerId)
        await this.checkFinishGame(game)
        await this.quizRepository.saveGame(game)
      }, 10000);
    }
  }

  private async addStatistic(game: Game, playerId: string) {
    console.log(`add statistic ${playerId}`)
    const player = await this.quizQueryRepository.findPlayerByPlayerId(playerId)
    if (!player) return false

    const secondPlayerId = this.findSecondPlayerId(game, player);

    const playerScore = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, player.id)
    const secondPlayerScore = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, secondPlayerId)
    if (!playerScore || !secondPlayerScore) return false

    if (playerScore.score === secondPlayerScore.score) {
      player.drawsCount += 1
    } else if (playerScore.score > secondPlayerScore.score) {
      player.winsCount += 1
    } else {
      player.lossesCount += 1
    }

    player.sumScore += playerScore.score
    player.avgScores = Math.round((player.sumScore / player.gamesCount) * 100) / 100;

    await this.quizRepository.savePlayer(player)
  }

  private async addScore(game: Game, player: QuizPlayer, answer: Answer) {
    const score = await this.quizQueryRepository.findPlayerScoreByUserId(
      game.id,
      player.id,
    );

    if (score && answer.answerStatus === 'Correct') {
      score.score += 1;
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
    answer: string | null,
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

  private async checkFinishGame(game: Game) {
    const isFinished = game.answer.length === 10 ? true : false;
    if (isFinished) {
      console.log('check finish game')
      game.finishGameDate = new Date().toISOString();
      game.status = 'Finished';

      await this.addBonus(game);

      await this.addStatistic(game, game.secondPlayer.id)
      await this.addStatistic(game, game.firstPlayer.id)
    }
  }

  private async addBonus(game: Game) {
    console.log('add bonus')
    // TODO: исправить начисления бонусных очков
    const answer = game.answer.find(answer => answer.answerStatus === 'Correct')
    if (!answer) return false

    const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, answer.userId)
    if (score) {
      score.score += 1
      await this.quizRepository.saveScore(score)
    }
  }
}
