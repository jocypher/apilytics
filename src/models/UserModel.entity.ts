import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm'
import { Organization } from './Organization.entity'
import { Membership } from './Membership.entity'
import { Log } from './Log.entity'

@Entity()
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  userId: string

  @Column({ type: 'text' })
  username: string

  @Column({ unique: true, type: 'text' })
  email: string

  @Column()
  passwordHash: string

  @CreateDateColumn()
  createdDate: Date

  @UpdateDateColumn()
  updatedDate: Date

  @Column({ nullable: true })
  refreshToken: string

  @OneToMany(() => Organization, (org) => org.createdBy)
  organizations: Organization[]

  @OneToMany(() => Membership, (member) => member.user)
  membership: Membership[]

  @OneToMany(() => Log, (log) => log.createdBy)
  manualLogs: Log[]
}
