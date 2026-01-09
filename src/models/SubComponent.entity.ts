import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Organization } from "./Organization.entity";
import { User } from "./User.entity";
import { log } from "node:console";
import { SubComponentUser } from "./SubComponentUser.entity";
import { Log } from "./Log.entity";

@Entity()
export class SubComponent{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(()=>Organization, (organization)=> organization.organization_name)
    @JoinColumn({name:"organization_id"})
    organization:Organization

    @ManyToOne(()=> User , (user)=>user.id)
    @JoinColumn({name:"created_by_id"})
    created_by: User

    @CreateDateColumn()
    created_at: Date

    @OneToMany(()=>SubComponentUser, (scu)=> scu.sub_component)
    users: SubComponentUser[]

    @OneToMany(()=>Log, (log)=> log.id)
    log: Log[]
}