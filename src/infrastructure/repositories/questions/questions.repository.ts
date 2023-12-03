import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/game/Question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async findQuestionById(id: string): Promise<Question | null> {
    return await this.questionsRepository
      .createQueryBuilder('q')
      .where('q.id = :id', {
        id,
      })
      .getOne();
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await this.questionsRepository
      .createQueryBuilder('q')
      .delete()
      .from(Question)
      .where('id = :id', {
        id,
      })
      .execute();

    return !!result.affected;
  }
}
