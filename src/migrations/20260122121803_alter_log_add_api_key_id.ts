import type{ MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogAddApiKey20260122121803 implements MigrationInterface{
    // name?: string | undefined;
    // transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log"
            ALTER COLUMN api_key_id DROP NOT NULL`
        )

        await queryRunner.query(
            `
            CREATE INDEX IF NOT EXISTS "IDX_api_key_id_created_at"
            ON "log" ("api_key_id", "created_at")
            `
        )
    }
   public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log"
            
            ALTER COLUMN api_key_id SET NOT NULL`
        )

        await queryRunner.query(
            `
            DROP INDEX IF EXISTS "IDX_api_key_id_created_at"
            `
        )
    }
    
}