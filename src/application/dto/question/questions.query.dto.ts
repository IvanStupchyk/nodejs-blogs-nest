import { SortOrder } from '../../../constants/sort.order';
import { QuestionViewType } from '../../../types/question.types';

export class QuestionsQueryDto {
  bodySearchTerm: string;
  publishedStatus: string;
  sortBy: keyof QuestionViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
