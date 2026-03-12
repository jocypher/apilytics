import type{ MigrationInterface, QueryRunner } from "typeorm";


export class AlterLogDeleteTags20260123152524 implements MigrationInterface{
    // name?: string | undefined;
    // transaction?: boolean | undefined;

  public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log" 
             DROP COLUMN IF EXISTS "tags"
            `
        )
    }
  public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "log"
             ADD COLUMN "tags" text[] DEFAULT ARRAY::text[]
            `
        )
    }
    
}