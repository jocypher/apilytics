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
import { Organization } from './organization-model.entity'
import { User } from './user-model.entity'
import { Log } from './log-item.entity'
import { SubComponent } from './organization-service.entity'

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  key_hash: string

  @Column()
  key_prefix: string

  @Column({ nullable: true })
  name: string

  @ManyToOne(() => SubComponent, (subc) => subc.api_keys)
  @JoinColumn({ name: 'organization_id' })
  subcomponent: SubComponent

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  created_by_user: User

  @Column({ nullable: true })
  is_active: boolean

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(() => Log, (log) => log.api_key)
  logs: Log[]
}
