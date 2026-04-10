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
import { Organization } from './Organization.entity'
import { UserModel } from './UserModel.entity'

import { AppUser } from './AppUser.entity'
import { Log } from './Log.entity'
import { ApiKey } from './ApiKey.entity'

@Entity()
export class App {
  @PrimaryGeneratedColumn('uuid')
  appId: string

  @Column()
  name: string

  @ManyToOne(() => Organization, (organization) => organization.organizationId, {onDelete:'CASCADE', onUpdate:'CASCADE'})
  @JoinColumn({ name: 'organizationId' })
  organization: Organization

  @ManyToOne(() => UserModel, (user) => user.userId, {onDelete:'SET NULL', onUpdate:'CASCADE'})
  @JoinColumn({ name: 'createdById' })
  createdBy: UserModel

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => AppUser, (appUser) => appUser.app)
  users: AppUser[]


  @OneToMany(() => Log, (log) => log.logId)
  log: Log[]

  @OneToMany(() => ApiKey, (apiKey) => apiKey.apps)
  apiKey: ApiKey[]
}
