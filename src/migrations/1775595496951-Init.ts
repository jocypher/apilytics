import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1775595496951 implements MigrationInterface {
    name = 'Init1775595496951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user" ("appUserId" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "assignedById" uuid, "assignedToId" uuid, "appId" uuid, CONSTRAINT "PK_182fd00b9fb1dfbb1d888b36eac" PRIMARY KEY ("appUserId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_64f17db3ad78f5cd8c155a4fa7" ON "app_user" ("appId", "assignedToId") `);
        await queryRunner.query(`CREATE TABLE "api_key" ("apiKeyId" SERIAL NOT NULL, "keyHash" character varying NOT NULL, "keyPrefix" character varying NOT NULL, "name" character varying, "isActive" boolean, "lastUsedDate" TIMESTAMP, "expiresDate" TIMESTAMP, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "apps" uuid, "createdByAdminId" uuid, CONSTRAINT "UQ_4aacb7c1641a74534c8a96c4dc9" UNIQUE ("keyHash"), CONSTRAINT "PK_bb44f960e117679a11f6b89bbcc" PRIMARY KEY ("apiKeyId"))`);
        await queryRunner.query(`CREATE TABLE "log_tag" ("logTagId" uuid NOT NULL DEFAULT uuid_generate_v4(), "tagName" character varying NOT NULL, "description" text, "organizationId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_09c0dc8d131478ffe492d355d50" PRIMARY KEY ("logTagId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7fc0aea91cff3c22bc76684f76" ON "log_tag" ("organizationId", "tagName") `);
        await queryRunner.query(`CREATE TYPE "public"."log_loglevel_enum" AS ENUM('info', 'warning', 'error', 'debug')`);
        await queryRunner.query(`CREATE TABLE "log" ("logId" uuid NOT NULL DEFAULT uuid_generate_v4(), "logMessage" text NOT NULL, "logLevel" "public"."log_loglevel_enum" NOT NULL DEFAULT 'info', "metadata" jsonb, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" uuid, "appId" uuid, "apiKeyId" integer, CONSTRAINT "PK_2a52ff321962f14587f210cd778" PRIMARY KEY ("logId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb5da66c79bb960c6aca75fe74" ON "log" ("appId", "createdDate") `);
        await queryRunner.query(`CREATE TABLE "app" ("appId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" uuid, "createdById" uuid, CONSTRAINT "PK_7ba9c9ca4cf02a4e3a8350e81fd" PRIMARY KEY ("appId"))`);
        await queryRunner.query(`CREATE TYPE "public"."membership_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TYPE "public"."membership_invitestatus_enum" AS ENUM('pending', 'accept', 'decline')`);
        await queryRunner.query(`CREATE TABLE "membership" ("membershipId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying, "role" "public"."membership_role_enum" NOT NULL DEFAULT 'member', "inviteStatus" "public"."membership_invitestatus_enum" NOT NULL DEFAULT 'pending', "joinedDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "invitedBy" character varying, "organizationId" uuid, "userId" uuid, CONSTRAINT "PK_fb7bd3f75d165f5f83de804c0d1" PRIMARY KEY ("membershipId"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("organizationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationName" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_7867970695572b3f6561516414d" PRIMARY KEY ("organizationId"))`);
        await queryRunner.query(`CREATE TABLE "user_model" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "email" text NOT NULL, "passwordHash" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "refreshToken" character varying, CONSTRAINT "UQ_864bd044bba869304084843358e" UNIQUE ("email"), CONSTRAINT "PK_4c45d8c361e22bb10f46be68f34" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "logLogTag" ("logId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_643b1ca8e9deef58ad1671efe06" PRIMARY KEY ("logId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_65b37db085f2081dc6a9e73909" ON "logLogTag" ("logId") `);
        await queryRunner.query(`CREATE INDEX "IDX_198465c35c71735635b9cd515e" ON "logLogTag" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_45a8318fff8e7b54ccfc09a9623" FOREIGN KEY ("assignedById") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_ba6902c6e67561b5f15e737a946" FOREIGN KEY ("assignedToId") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c" FOREIGN KEY ("appId") REFERENCES "app"("appId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key" ADD CONSTRAINT "FK_e45915c9d4942bc6487f01c0dfe" FOREIGN KEY ("apps") REFERENCES "app"("appId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key" ADD CONSTRAINT "FK_03cc85581f9e88eb22e115e6b6e" FOREIGN KEY ("createdByAdminId") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_a1f93025189ebe0b57c12de8496" FOREIGN KEY ("createdBy") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_7949b23ad7fa4169c56f7dc4f65" FOREIGN KEY ("appId") REFERENCES "app"("appId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_e3c3fae9fff2bac91e83b791aec" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("apiKeyId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app" ADD CONSTRAINT "FK_7b9c9502e0197c9a959877f71d9" FOREIGN KEY ("organizationId") REFERENCES "organization"("organizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app" ADD CONSTRAINT "FK_9b4630b0929fb82d39971970b17" FOREIGN KEY ("createdById") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_4c62c8a7ba2337d6d6ffcd8eb6d" FOREIGN KEY ("organizationId") REFERENCES "organization"("organizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4" FOREIGN KEY ("userId") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_acdbd1e490930af04b4ff569ca9" FOREIGN KEY ("createdById") REFERENCES "user_model"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logLogTag" ADD CONSTRAINT "FK_65b37db085f2081dc6a9e739091" FOREIGN KEY ("logId") REFERENCES "log"("logId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "logLogTag" ADD CONSTRAINT "FK_198465c35c71735635b9cd515e7" FOREIGN KEY ("tagId") REFERENCES "log_tag"("logTagId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logLogTag" DROP CONSTRAINT "FK_198465c35c71735635b9cd515e7"`);
        await queryRunner.query(`ALTER TABLE "logLogTag" DROP CONSTRAINT "FK_65b37db085f2081dc6a9e739091"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_acdbd1e490930af04b4ff569ca9"`);
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4"`);
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_4c62c8a7ba2337d6d6ffcd8eb6d"`);
        await queryRunner.query(`ALTER TABLE "app" DROP CONSTRAINT "FK_9b4630b0929fb82d39971970b17"`);
        await queryRunner.query(`ALTER TABLE "app" DROP CONSTRAINT "FK_7b9c9502e0197c9a959877f71d9"`);
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_e3c3fae9fff2bac91e83b791aec"`);
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_7949b23ad7fa4169c56f7dc4f65"`);
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_a1f93025189ebe0b57c12de8496"`);
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_03cc85581f9e88eb22e115e6b6e"`);
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_e45915c9d4942bc6487f01c0dfe"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_ba6902c6e67561b5f15e737a946"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_45a8318fff8e7b54ccfc09a9623"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_198465c35c71735635b9cd515e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b37db085f2081dc6a9e73909"`);
        await queryRunner.query(`DROP TABLE "logLogTag"`);
        await queryRunner.query(`DROP TABLE "user_model"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "membership"`);
        await queryRunner.query(`DROP TYPE "public"."membership_invitestatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."membership_role_enum"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb5da66c79bb960c6aca75fe74"`);
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TYPE "public"."log_loglevel_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fc0aea91cff3c22bc76684f76"`);
        await queryRunner.query(`DROP TABLE "log_tag"`);
        await queryRunner.query(`DROP TABLE "api_key"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64f17db3ad78f5cd8c155a4fa7"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
    }

}
