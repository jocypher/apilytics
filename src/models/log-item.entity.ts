import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user-model.entity'
import { SubComponent } from './organization-service.entity'
import { ApiKey } from './api-key.entity'

@Entity()
@Index(['organization_id', 'created_at'])
@Index(['sub_component', 'created_at'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text' })
  message: string

  @Column({
    type: 'enum',
    enum: ['info', 'warning', 'error', 'debug'],
    default: 'info',
  })
  logLevel: 'info' | 'warning' | 'error' | 'debug'

  @Column({
    nullable: true,
  })
  organization_id: number

  @ManyToOne(() => User, (user) => user.manual_logs, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User

  @ManyToOne(() => SubComponent, (subcomponent) => subcomponent.log)
  @JoinColumn({ name: 'sub_component_id' })
  sub_component: SubComponent

  @ManyToOne(() => ApiKey, (apiKey) => apiKey.logs)
  @JoinColumn({ name: 'api_key_id' })
  api_key: ApiKey

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>

  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  @CreateDateColumn()
  created_at: Date
}
