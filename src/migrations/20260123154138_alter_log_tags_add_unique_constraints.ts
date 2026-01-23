import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogsTableAddConstraints20260123154138 implements MigrationInterface{
    name?: string | undefined;
    transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<any> {
       await queryRunner.query(
        `ALTER TABLE "logs"
        ADD CONSTRAINT "UQ_log_tag" UNIQUE("organization_id","tag_name") 
        `
       )
    }
   public async down(queryRunner: QueryRunner): Promise<any> {
       await queryRunner.query(
        `ALTER TABLE "logs"
        DROP CONSTRAINT "UQ_log_tag"
        `
       )
    }
    
}