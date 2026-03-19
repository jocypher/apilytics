import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1773918917963 implements MigrationInterface {
  name = 'Init1773918917963'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sub_component_user" ("id" SERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "assigned_by_id" uuid, "user_id" uuid, "sub_component_id" integer, CONSTRAINT "PK_0aea57bd521245d24fa3445f21c" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fac00872cfdd8a7bd9a7c0bfb1" ON "sub_component_user" ("sub_component_id", "user_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "api_key" ("id" SERIAL NOT NULL, "key_hash" character varying NOT NULL, "key_prefix" character varying NOT NULL, "name" character varying, "is_active" boolean, "last_used_at" TIMESTAMP, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subcomponent" integer, "created_by_id" uuid, CONSTRAINT "UQ_3c9751d2a6011ba13e27838105e" UNIQUE ("key_hash"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "log_tag" ("id" SERIAL NOT NULL, "tag_name" character varying NOT NULL, "description" text, "organization_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3150d0b2a45872d8fade17760ef" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fbb463fe59980b5ea73f8e52b0" ON "log_tag" ("organization_id") `
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_05b49f1abfe4e65ef3f0fb698e" ON "log_tag" ("organization_id", "tag_name") `
    )
    await queryRunner.query(
      `CREATE TYPE "public"."log_loglevel_enum" AS ENUM('info', 'warning', 'error', 'debug')`
    )
    await queryRunner.query(
      `CREATE TABLE "log" ("id" SERIAL NOT NULL, "message" text NOT NULL, "logLevel" "public"."log_loglevel_enum" NOT NULL DEFAULT 'info', "organization_id" integer, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" uuid, "sub_component_id" integer, "api_key_id" integer, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d95ea60a1c45f4f36981ac6d00" ON "log" ("sub_component_id", "created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4798341f67bcbbea0b19716a3d" ON "log" ("organization_id", "created_at") `
    )
    await queryRunner.query(
      `CREATE TABLE "sub_component" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "organization_id" uuid, "created_by_id" uuid, CONSTRAINT "PK_749859c4623b449e9f12ce235f0" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."organization_user_role_enum" AS ENUM('admin', 'member', 'owner')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."organization_user_invite_status_enum" AS ENUM('pending', 'accepted', 'rejected')`
    )
    await queryRunner.query(
      `CREATE TABLE "organization_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "display_name" character varying, "role" "public"."organization_user_role_enum" NOT NULL DEFAULT 'member', "invite_status" "public"."organization_user_invite_status_enum" NOT NULL DEFAULT 'pending', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "invited_by_user_id" character varying, "organization_id" uuid, "user_id" uuid, CONSTRAINT "PK_b93269ca4d9016837d22ab6e1e0" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" uuid, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "email" text NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "refreshKey" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "log_log_tag" ("log_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_7a4142ff0ec3e1fa6cd229c864f" PRIMARY KEY ("log_id", "tag_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_9c55bfc526464cd52535c62fb9" ON "log_log_tag" ("log_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ad9ba0d0c6e75444e3d760eedb" ON "log_log_tag" ("tag_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" ADD CONSTRAINT "FK_34f5fd3c4fe6c8c6cd07f457194" FOREIGN KEY ("assigned_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" ADD CONSTRAINT "FK_d14e823d234ae627d159458b0dc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" ADD CONSTRAINT "FK_80ba61da3074ffe83a00d135dde" FOREIGN KEY ("sub_component_id") REFERENCES "sub_component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_8efe7c679215735da4493f0bf80" FOREIGN KEY ("subcomponent") REFERENCES "sub_component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_1799b360b8b068fa98feb7bef75" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "log" ADD CONSTRAINT "FK_11b2d89239496a9c9f4e374d795" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "log" ADD CONSTRAINT "FK_1a5f4f099a4ef32a948c977891f" FOREIGN KEY ("sub_component_id") REFERENCES "sub_component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "log" ADD CONSTRAINT "FK_9da059c5e743d93d0a4c61aa830" FOREIGN KEY ("api_key_id") REFERENCES "api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component" ADD CONSTRAINT "FK_b1961f25192515df533a5900765" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component" ADD CONSTRAINT "FK_174d5bf7351f3b6e1bc2a0917b3" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_user" ADD CONSTRAINT "FK_e2aaa5ea0d28c4e9196b107781e" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_user" ADD CONSTRAINT "FK_f29cfb2e32f6d58394bf0ce7e5c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization" ADD CONSTRAINT "FK_d3c5f450939bf4fd56f844823cf" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "log_log_tag" ADD CONSTRAINT "FK_9c55bfc526464cd52535c62fb94" FOREIGN KEY ("log_id") REFERENCES "log"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "log_log_tag" ADD CONSTRAINT "FK_ad9ba0d0c6e75444e3d760eedbb" FOREIGN KEY ("tag_id") REFERENCES "log_tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "log_log_tag" DROP CONSTRAINT "FK_ad9ba0d0c6e75444e3d760eedbb"`
    )
    await queryRunner.query(
      `ALTER TABLE "log_log_tag" DROP CONSTRAINT "FK_9c55bfc526464cd52535c62fb94"`
    )
    await queryRunner.query(
      `ALTER TABLE "organization" DROP CONSTRAINT "FK_d3c5f450939bf4fd56f844823cf"`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_user" DROP CONSTRAINT "FK_f29cfb2e32f6d58394bf0ce7e5c"`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_user" DROP CONSTRAINT "FK_e2aaa5ea0d28c4e9196b107781e"`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component" DROP CONSTRAINT "FK_174d5bf7351f3b6e1bc2a0917b3"`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component" DROP CONSTRAINT "FK_b1961f25192515df533a5900765"`
    )
    await queryRunner.query(
      `ALTER TABLE "log" DROP CONSTRAINT "FK_9da059c5e743d93d0a4c61aa830"`
    )
    await queryRunner.query(
      `ALTER TABLE "log" DROP CONSTRAINT "FK_1a5f4f099a4ef32a948c977891f"`
    )
    await queryRunner.query(
      `ALTER TABLE "log" DROP CONSTRAINT "FK_11b2d89239496a9c9f4e374d795"`
    )
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_1799b360b8b068fa98feb7bef75"`
    )
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_8efe7c679215735da4493f0bf80"`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" DROP CONSTRAINT "FK_80ba61da3074ffe83a00d135dde"`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" DROP CONSTRAINT "FK_d14e823d234ae627d159458b0dc"`
    )
    await queryRunner.query(
      `ALTER TABLE "sub_component_user" DROP CONSTRAINT "FK_34f5fd3c4fe6c8c6cd07f457194"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad9ba0d0c6e75444e3d760eedb"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c55bfc526464cd52535c62fb9"`
    )
    await queryRunner.query(`DROP TABLE "log_log_tag"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TABLE "organization"`)
    await queryRunner.query(`DROP TABLE "organization_user"`)
    await queryRunner.query(
      `DROP TYPE "public"."organization_user_invite_status_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."organization_user_role_enum"`)
    await queryRunner.query(`DROP TABLE "sub_component"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4798341f67bcbbea0b19716a3d"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d95ea60a1c45f4f36981ac6d00"`
    )
    await queryRunner.query(`DROP TABLE "log"`)
    await queryRunner.query(`DROP TYPE "public"."log_loglevel_enum"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05b49f1abfe4e65ef3f0fb698e"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbb463fe59980b5ea73f8e52b0"`
    )
    await queryRunner.query(`DROP TABLE "log_tag"`)
    await queryRunner.query(`DROP TABLE "api_key"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fac00872cfdd8a7bd9a7c0bfb1"`
    )
    await queryRunner.query(`DROP TABLE "sub_component_user"`)
  }
}
