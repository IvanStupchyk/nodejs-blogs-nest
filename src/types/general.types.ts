import { SortOrder } from '../constants/sort.order';
import {
  mockBlogModel,
  mockCommentModel,
  mockGameModel,
  mockPostModel,
  mockQuestionModel,
  mockUserModel,
} from '../constants/blanks';
import { UserViewType } from './users.types';
import { BlogViewType } from './blogs.types';
import { CommentViewType } from './comments.types';
import { PostType } from './posts.types';
import { QuestionViewType } from './question.types';
import { Game } from '../entities/game/Game.entity';

export enum likeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export type SortConditionsType = {
  pageNumber: string;
  pageSize: string;
  sortBy?:
    | keyof BlogViewType
    | keyof PostType
    | keyof UserViewType
    | keyof CommentViewType
    | keyof QuestionViewType
    | keyof Game;
  model?:
    | typeof mockBlogModel
    | typeof mockPostModel
    | typeof mockUserModel
    | typeof mockCommentModel
    | typeof mockQuestionModel
    | typeof mockGameModel;
  sortDirection?: SortOrder.asc | SortOrder.desc;
};
