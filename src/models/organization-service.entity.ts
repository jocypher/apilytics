import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Organization } from './organization-model.entity'
import { User } from './user-model.entity'

import { SubComponentUser } from './org-service-user.entity'
import { Log } from './log-item.entity'

@Entity()
export class SubComponent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(
    () => Organization,
    (organization) => organization.organization_name
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User

  @CreateDateColumn()
  created_at: Date

  @OneToMany(() => SubComponentUser, (scu) => scu.sub_component)
  users: SubComponentUser[]

  @OneToMany(() => Log, (log) => log.id)
  log: Log[]
}
