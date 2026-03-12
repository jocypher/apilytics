import type
{ MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogsTableAddConstraints20260123154138 implements MigrationInterface{
    name?: string | undefined;
    transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(
        `ALTER TABLE "log_tag"
        ADD CONSTRAINT "UQ_log_tag_org_name" UNIQUE("organization_id","tag_name") 
        `
       )
    }
   public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(
        `ALTER TABLE "log"
        DROP CONSTRAINT "UQ_log_tag"
        `
       )
    }
    
}