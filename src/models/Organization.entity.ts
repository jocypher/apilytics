import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { SubComponent } from "./SubComponent.entity";
import { ApiKey } from "./ApiKey.entity";
import { OrganizationUser } from "./OrganizationUser.entity";


@Entity()
export class Organization{
    @PrimaryGeneratedColumn("uuid")
    id: number

    @Column()
    organization_name: string

    @ManyToOne(()=>User, (user)=>user.id)
    @JoinColumn({name: "created_by_id"})
    created_by: User

    @Column()
    created_by_id: string

    @OneToMany(()=>SubComponent, (components)=> components.organization)
    sub_components: SubComponent[]

    @OneToMany(()=>ApiKey, (apiKey)=>apiKey.organization)
    api_keys: ApiKey[]

    @OneToMany(()=>OrganizationUser, (orgUser)=>orgUser.organization)
    members: OrganizationUser[]


    @CreateDateColumn()
    created_at: Date
}