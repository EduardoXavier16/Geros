import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletedAtToWorkOrders1746932057039
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('work_orders', {
      name: 'completedAt',
      type: 'timestamp',
      isNullable: true,
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('work_orders', 'completedAt');
  }
}
