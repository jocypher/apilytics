import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UserModel } from './UserModel.entity'
import { App } from './App.entity'
import { LogTag } from './LogTag.entity'
import { LogLevel } from '../enums/logLevel.enum'


@Entity()
@Index(['apps', 'createdDate'])
export class Log {
  @PrimaryGeneratedColumn('uuid')
  logId: string

  @Column({ type: 'text' })
  logMessage: string

  @Column({
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO,
  })
  logLevel: LogLevel

  @ManyToOne(() => UserModel, (user) => user.manualLogs, { nullable: true, onDelete:'CASCADE', onUpdate:'SET NULL'})
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserModel

  @ManyToOne(() => App, (app) => app.log, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'appId' })
  apps: App


  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>

  @ManyToMany(() => LogTag, (tag) => tag.logs, {onDelete:'CASCADE', onUpdate:'CASCADE'})
  @JoinTable({
    name: 'logLogTag',
    joinColumn: { name: 'logId', referencedColumnName: 'logId' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'logTagId' },
  })
  tags: LogTag[]

  @Column({default:false})
  isManual: boolean
  @CreateDateColumn()
  createdDate: Date
}
