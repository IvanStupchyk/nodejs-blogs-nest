import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockQuestionModel } from '../../../constants/blanks';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../../entities/game/Question.entity';
import { QuestionsQueryDto } from '../../../application/dto/question/questions.query.dto';
import { QuestionsViewType } from '../../../types/question.types';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async getSortedQuestions(
    params: QuestionsQueryDto,
  ): Promise<QuestionsViewType> {
    const { bodySearchTerm, publishedStatus } = params;
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockQuestionModel,
      });

    let finalPublishedStatus;

    switch (publishedStatus) {
      case 'published':
        finalPublishedStatus = true;
        break;
      case 'notPublished':
        finalPublishedStatus = false;
        break;
      default:
        finalPublishedStatus = null;
    }

    const questions = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${bodySearchTerm ? `(q.body ilike :body)` : 'q.body is not null'}`,
        {
          body: `%${bodySearchTerm}%`,
        },
      )
      .andWhere(
        `${
          finalPublishedStatus === true || finalPublishedStatus === false
            ? `(q.published = :published)`
            : 'q.published is not null'
        }`,
        {
          published: finalPublishedStatus,
        },
      )
      .orderBy(`q.${sortBy}`, sortDirection)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const questionsCount = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${bodySearchTerm ? `(q.body ilike :body)` : 'q.body is not null'}`,
        {
          body: `%${bodySearchTerm}%`,
        },
      )
      .andWhere(
        `${
          finalPublishedStatus === true || finalPublishedStatus === false
            ? `(q.published = :published)`
            : 'q.published is not null'
        }`,
        {
          published: finalPublishedStatus,
        },
      )
      .getCount();

    const pagesCount = getPagesCount(questionsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: questionsCount,
      items: questions.length
        ? questions.map((q) => {
            return {
              id: q.id.toString(),
              body: q.body,
              correctAnswers: q.correctAnswers,
              published: q.published,
              updatedAt: q.updatedAt,
              createdAt: q.createdAt,
            };
          })
        : [],
    };
  }
}
