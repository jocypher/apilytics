import type { MigrationInterface, QueryRunner } from "typeorm";


export class AlterUserTable20260107102530 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "user"
            ADD CONSTRAINT "UQ_user_emai" UNIQUE ("email")`
        )
    }
   public async down(queryRunner: QueryRunner): Promise<any> {
        
        await queryRunner.query(
            `ALTER TABLE "user"
            DROP CONSTRAINT "UQ_user_email"
            `
        )
    }

}