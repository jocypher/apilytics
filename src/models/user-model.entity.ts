import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm'
import { Organization } from './organization-model.entity'
import { OrganizationUser } from './organization-user.entity'
import { Log } from './log-item.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  username: string

  @Column({ unique: true, type: 'text' })
  email: string

  @Column()
  password_hash: string

  @CreateDateColumn()
  created_at: Date

  @Column({nullable: true})
  refreshKey: string

  @OneToMany(() => Organization, (org) => org.created_by)
  organizations: Organization[]

  @OneToMany(() => OrganizationUser, (orgUser) => orgUser.user)
  organization_members: OrganizationUser[]

  @OneToMany(() => Log, (log) => log.created_by)
  manual_logs: Log[]
}
