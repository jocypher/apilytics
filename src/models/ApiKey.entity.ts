import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserModel } from './UserModel.entity'
import { Log } from './Log.entity'
import { App } from './App.entity'

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  apiKeyId: number

  @Column({ unique: true })
  keyHash: string

  @Column()
  keyPrefix: string

  @Column({ nullable: true })
  name: string

  @ManyToOne(() => App, (app) => app.apiKey)
  @JoinColumn({ name: 'apps' })
  apps: App

  @ManyToOne(() => UserModel, (user) => user.userId)
  @JoinColumn({ name: 'createdByAdminId' })
  createdByAdmin: UserModel

  @Column({ nullable: true })
  isActive: boolean

  @Column({ type: 'timestamp', nullable: true })
  lastUsedDate: Date

  @Column({ type: 'timestamp', nullable: true })
  expiresDate: Date

  @CreateDateColumn()
  createdDate: Date

  @UpdateDateColumn()
  updatedDate: Date

  @OneToMany(() => Log, (log) => log.apiKey)
  logs: Log[]
}
