import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Log } from './log-item.entity'

@Entity()
@Index(['organization_id', 'tag_name'], { unique: true })
export class LogTag {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  tag_name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Index()
  @Column()
  organization_id: number

  @ManyToMany(() => Log, (log) => log.tags)
  logs: Log[]

  @CreateDateColumn()
  created_at: Date
}
