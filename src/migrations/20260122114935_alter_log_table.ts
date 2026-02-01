import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogTable2026122114935 implements MigrationInterface{


    // name?: string | undefined;
    // transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<any> {
       await queryRunner.query(
        `ALTER TABLE "log" DROP COLUMN IF EXISTS organization_id`
       )
    }
   public async down(queryRunner: QueryRunner): Promise<any> {

        await queryRunner.query(
            `ALTER TABLE "log" ADD COLUMN organization_id`
        )
    }


}