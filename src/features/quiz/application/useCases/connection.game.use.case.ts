import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { QuizRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.repository.typeorm';
import { QuizPlayer } from '@quiz/domain/typeorm/quiz.player.entity';
import { QuizScore } from '@quiz/domain/typeorm/quiz.score.entity';
import { Game } from '@quiz/domain/typeorm/quiz.game';

export class ConnectionGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionGameCommand)
export class ConnectionGameUseCase {
  constructor(
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
    private quizRepository: QuizRepositoryTypeorm,
  ) {}

  async execute(command: ConnectionGameCommand): Promise<string | boolean> {
    const { userId } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    let player = await this.quizQueryRepository.findPlayerById(user.id);

    if (player) {
      player.gamesCount += 1;
      await this.quizRepository.savePlayer(player);
    }

    if (!player) {
      player = new QuizPlayer();
      player.userId = user.id;
      player.user = user;
      player.gamesCount = 1;
      await this.quizRepository.savePlayer(player);
    }

    const activeGame =
      await this.quizQueryRepository.findMyCurrentGameFullByUserId(player.id);
    if (activeGame) throw new ForbiddenException();

    const pendingGame = await this.quizQueryRepository.findPendingGame();

    const score = new QuizScore();

    if (!pendingGame) {
      const game = new Game();

      game.firstPlayer = player;
      game.pairCreatedDate = new Date().toISOString();
      game.status = 'PendingSecondPlayer';

      await this.quizRepository.saveGame(game);

      score.user = player;
      score.userId = player.id;
      score.game = game;

      await this.quizRepository.saveScore(score);
      return game.id;
    }

    const randomQuestion =
      await this.quizQueryRepository.getFiveRandomQuestion();

    pendingGame.secondPlayer = player;
    pendingGame.startGameDate = new Date().toISOString();
    pendingGame.status = 'Active';
    pendingGame.questions = randomQuestion;

    await this.quizRepository.saveGame(pendingGame);

    score.user = player;
    score.userId = player.id;
    score.game = pendingGame;

    await this.quizRepository.saveScore(score);

    return pendingGame.id;
  }
}
