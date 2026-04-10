import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,

  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserModel } from './UserModel.entity'
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

  @ManyToOne(() => App, (app) => app.apiKey, {onDelete:'CASCADE', onUpdate:'CASCADE'})
  @JoinColumn({ name: 'apps' })
  apps: App

  @ManyToOne(() => UserModel, (user) => user.userId, {onDelete:'CASCADE',onUpdate:'SET NULL'})
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
}
