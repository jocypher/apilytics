import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Organization } from './Organization.entity'
import { UserModel } from './UserModel.entity'
import { MembershipRole } from '../enums/membershipRole.enum'
import { InviteStatus } from '../enums/inviteStatus.enum'

@Entity()
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  membershipId: string

  @Column({ nullable: true })
  username: string

  @ManyToOne(() => Organization, (org) => org.apps)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization

  @ManyToOne(() => UserModel, (user) => user.membership)
  @JoinColumn({ name: 'userId' })
  user: UserModel

  @Column({
    type: 'enum',
    enum: MembershipRole,
    default: MembershipRole.MEMBER,
  })
  role: MembershipRole

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  inviteStatus: InviteStatus

  @CreateDateColumn()
  joinedDate: Date

  @UpdateDateColumn()
  updatedDate: Date

  @Column({ nullable: true })
  invitedBy: string
}
