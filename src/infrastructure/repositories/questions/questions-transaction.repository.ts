import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Question } from '../../../entities/game/Question.entity';

@Injectable()
export class QuestionsTransactionRepository {
  async takeBunchRandomQuestions(
    amount: number,
    manager: EntityManager,
  ): Promise<Question[]> {
    return await manager
      .createQueryBuilder(Question, 'q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .limit(amount)
      .getMany();
  }
}
