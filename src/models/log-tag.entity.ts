import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class LogTag {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  tag_name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column()
  organization_id: number

  @CreateDateColumn()
  created_at: Date
}
