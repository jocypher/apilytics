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
@Index(['organizationId', 'tagName'], { unique: true })
export class LogTag {
  @PrimaryGeneratedColumn("uuid")
  logTagId: string

  @Column()
  tagName: string

  @Column({ type: 'text', nullable: true })
  description: string

  // confirm if we need this 
  @Column()
  organizationId: string

  @ManyToMany(() => Log, (log) => log.tags)
  logs: Log[]

  @CreateDateColumn()
  createdDate: Date

  @UpdateDateColumn()
  updatedDate: Date
}
