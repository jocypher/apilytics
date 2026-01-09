import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Organization } from "./Organization.entity";
import { OrganizationUser } from "./OrganizationUser.entity";
import { Log } from "./Log.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type:"text"})
    username: string;

    @Column({unique: true, type:"text"})
    email: string;

    @Column()
    password_hash: string;


    @CreateDateColumn()
    created_at: Date;

    @OneToMany(()=>Organization , (org)=>org.created_by)
    organizations: Organization[]

    @OneToMany(()=>OrganizationUser, (orgUser)=> orgUser.user)
    organization_members: OrganizationUser[]

    @OneToMany(()=>Log, (log)=>log.created_by)
    manual_logs: Log[]
}