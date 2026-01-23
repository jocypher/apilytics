import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateLogTagJoinTable20260123154742 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "log_log_tag" (
        log_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        CONSTRAINT pk_log_log_tag PRIMARY KEY (log_id, tag_id),
        CONSTRAINT fk_log FOREIGN KEY (log_id)
          REFERENCES "log"(id) ON DELETE CASCADE,
        CONSTRAINT fk_tag FOREIGN KEY (tag_id)
          REFERENCES "log_tag"(id) ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`
      CREATE INDEX idx_log_log_tag_log_id ON log_log_tag(log_id)
    `)

    await queryRunner.query(`
      CREATE INDEX idx_log_log_tag_tag_id ON log_log_tag(tag_id)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log_log_tag"`)
  }

}
