import type{ MigrationInterface, QueryRunner } from "typeorm";

export class AlterLogTableDeleteOrgId2026012345100 implements MigrationInterface{
  
   public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE "log" DROP COLUMN "organization_id"`)
    }
  public async  down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" ADD COLUMN "organization_id" SET NULL`)
    }
    
}