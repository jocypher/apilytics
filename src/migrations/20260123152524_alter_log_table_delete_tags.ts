import { MigrationInterface, QueryRunner } from "typeorm";


export class AlterLogDeleteTags20260123152524 implements MigrationInterface{
    // name?: string | undefined;
    // transaction?: boolean | undefined;

  public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "logs" 
             DROP COLUMN IF EXISTS "tags"
            `
        )
    }
  public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "logs"
             ADD COLUMN "tags" text[] DEFAULT ARRAY::text[]
            `
        )
    }
    
}