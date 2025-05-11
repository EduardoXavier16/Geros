import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToUsers1746932038107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', {
      name: 'phoneNumber',
      type: 'varchar',
      length: '20',
      isNullable: true,
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phoneNumber');
  }
}
