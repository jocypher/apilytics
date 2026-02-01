import { MigrationInterface, QueryRunner } from "typeorm";


export class FixSchemaOrgTable20260201131420 implements MigrationInterface{
    name?: string | undefined;
    transaction?: boolean | undefined;
   public async up(queryRunner: QueryRunner): Promise<any> {
        
    }
   public async down(queryRunner: QueryRunner): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}