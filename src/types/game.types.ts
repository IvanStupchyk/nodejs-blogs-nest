export type AnswerType = {
  questionId: string;
  answerStatus: string;
  addedAt: Date;
};

type QuestionType = {
  id: string;
  body: string;
};

type PlayerType = {
  id: string;
  login: string;
};

type PlayerProgressType = {
  answers: AnswerType[];
  player: PlayerType;
  score: number;
};

export type GameViewType = {
  id: string;
  firstPlayerProgress: PlayerProgressType;
  secondPlayerProgress: PlayerProgressType | null;
  questions: QuestionType[] | null;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
};
