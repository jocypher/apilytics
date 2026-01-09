import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./Organization.entity";
import { User } from "./User.entity";


@Entity()
export class OrganizationUser{

    @PrimaryGeneratedColumn()
    id: number 

    @Column()
    name: string

    @ManyToOne(()=>Organization, (uorg)=>uorg.sub_components)
    @JoinColumn({name:"organization_id"})
    org:Organization

    @ManyToOne(()=>User , (user)=>user.organization_members)
    @JoinColumn({name:"user_id"})
    user: User

    @Column({
        type:"enum",
        enum:["admin", "member"],
        default:"member"
    })
    role: "member" | "admin"

    @Column({
        type: "enum",
        enum:["pending", "accepted", "rejected"], 
        default: "pending"
    })
    invite_status: "pending" | "accepted" | "rejected"

    @CreateDateColumn()
    invited_at: Date

    @UpdateDateColumn()
    updated_at: Date
    

}