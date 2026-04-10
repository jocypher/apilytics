import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Log } from './Log.entity'

@Entity()
@Index(['tagName'], { unique: true })
export class LogTag {
  @PrimaryGeneratedColumn("uuid")
  logTagId: string

  @Column()
  tagName: string

  @Column({ type: 'text', nullable: true })
  description: string

  @ManyToMany(() => Log, (log) => log.tags, {onDelete:'CASCADE', onUpdate:'CASCADE'})
  logs: Log[]

  @CreateDateColumn()
  createdDate: Date

  @UpdateDateColumn()
  updatedDate: Date
}
