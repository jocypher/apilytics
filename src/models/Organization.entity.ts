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
import { App } from './App.entity'
import { Membership } from './Membership.entity'

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  organizationId: string

  @Column()
  organizationName: string

  @ManyToOne(() => UserModel, (user) => user.userId)
  @JoinColumn({ name: 'createdById' })
  createdBy: UserModel

  @OneToMany(() => App, (app) => app.organization)
  apps: App[]

  @OneToMany(() => Membership, (member) => member.organization)
  members: Membership[]

  @CreateDateColumn()
  createdDate: Date

  @UpdateDateColumn()
  updatedDate: Date
}
