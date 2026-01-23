import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateLogTagJoinTable20260123133320 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "log_tags_map" (
        log_id INTEGER NOT NULL REFERENCES "log"(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES "log_tag"(id) ON DELETE CASCADE,
        PRIMARY KEY (log_id, tag_id)
      )
    `)

    await queryRunner.query(`
      CREATE INDEX idx_log_tags_log_id ON log_tags_map(log_id)
    `)

    await queryRunner.query(`
      CREATE INDEX idx_log_tags_tag_id ON log_tags_map(tag_id)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log_tags_map"`)
  }
}
