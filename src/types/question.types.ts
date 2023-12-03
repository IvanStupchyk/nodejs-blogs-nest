export type QuestionViewType = {
  id: string;
  body: string;
  correctAnswers: Array<string>;
  published: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export type QuestionsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<QuestionViewType>;
};
