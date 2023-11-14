export class QuizGameModel {
  id: string;
  firstPlayerProgress: QuizPlayerModel;
  secondPlayerProgress: null | QuizPlayerModel;
  questions: null | QuizQuestModel[];
  status: 'PendingSecondPlayer' | 'Active';
  pairCreatedDate: null | string;
  startGameDate: null | string;
  finishGameDate: null | string;
}

class QuizPlayerModel {
  answers: null | QuizResponseModel[];
  player: null | {
    id: string;
    login: string;
  };
  score: number;
}

class QuizResponseModel {
  questionId: string;
  answerStatus: string;
  addedAt: string;
}

class QuizQuestModel {
  id: string;
  body: string;
}
