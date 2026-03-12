import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogTableAddSubComponentId20260122120647 implements MigrationInterface{
    name?: string | undefined;
    transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log"
            ALTER COLUMN "sub_component_id" DROP NOT NULL
            `
        )

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_log_sub_component_created_at"
            ON "log" ("sub_component_id", "created_at")
            `
        )
    }
  public async  down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log"  
            ALTER COLUMN "sub_component_id" SET NOT NULL`
        )

        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_log_sub_component_created_at"`
        )
    }

}