export const answersFinder = (questions: any, gameQuestionId: string) =>
  questions.body.items.find((q) => q.id === gameQuestionId && q.published)
    .correctAnswers;
