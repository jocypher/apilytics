import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UserModel } from './UserModel.entity'
import { App } from './App.entity'

@Entity()
@Index(['app', 'assignedTo'], { unique: true })
export class AppUser {
  @PrimaryGeneratedColumn('uuid')
  appUserId: string

  @ManyToOne(() => UserModel, (user) => user.userId, {onDelete:'SET NULL', onUpdate:'CASCADE'}, )
  @JoinColumn({ name: 'assignedById' })
  assignedBy: UserModel

  @ManyToOne(() => UserModel, (user) => user.userId, {onDelete:'SET NULL', onUpdate:'CASCADE'})
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: UserModel

  @ManyToOne(() => App, (app) => app.users, {onDelete:'CASCADE', onUpdate:'CASCADE'})
  @JoinColumn({ name: 'appId' })
  app: App

  @CreateDateColumn()
  createdDate: Date
}
