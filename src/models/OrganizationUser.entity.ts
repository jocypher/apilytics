import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./Organization.entity";
import { User } from "./User.entity";


@Entity()
export class OrganizationUser{

    @PrimaryGeneratedColumn("uuid")
    id: string 

    @Column({nullable:true})
    display_name: string

    @ManyToOne(()=>Organization, (uorg)=>uorg.sub_components)
    @JoinColumn({name:"organization_id"})
    organization:Organization

    @ManyToOne(()=>User , (user)=>user.organization_members)
    @JoinColumn({name:"user_id"})
    user: User

    @Column({
        type:"enum",
        enum:["admin", "member", "owner"],
        default:"member"
    })
    role: "owner"|"member" | "admin"

    @Column({
        type: "enum",
        enum:["pending", "accepted", "rejected"], 
        default: "pending"
    })
    invite_status: "pending" | "accepted" | "rejected"

    @CreateDateColumn()
    joined_at: Date

    @UpdateDateColumn()
    updated_at: Date
    
    @Column({ nullable: true })
    invited_by_user_id: string;

}