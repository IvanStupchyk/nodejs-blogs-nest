import { DataSource, EntityManager } from 'typeorm';

export abstract class TransactionUseCase<C, R> {
  protected constructor(protected readonly dataSource: DataSource) {}

  abstract mainLogic(command: C, manager: EntityManager): Promise<R>;

  public async execute(command: C) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const res = await this.mainLogic(command, queryRunner.manager);
      await queryRunner.commitTransaction();
      return res;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
