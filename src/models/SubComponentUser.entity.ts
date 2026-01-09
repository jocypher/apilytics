import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Organization } from "./Organization.entity";
import { SubComponent } from "./SubComponent.entity";

@Entity()
@Index(["sub_component", "user"], {unique:true})
export class SubComponentUser{
    @PrimaryGeneratedColumn()
    id:number

    @ManyToOne(()=>User, (user)=>user.id)
    @JoinColumn({name:"assigned_by_id"})
    assigned_by:User

    @ManyToOne(()=>User, (user)=>user.id)
    @JoinColumn({name:"user_id"})
    user:User

    @ManyToOne(() => SubComponent, (component) => component.users)
    @JoinColumn({ name: "sub_component_id" })
    sub_component: SubComponent;

    @CreateDateColumn()
    created_date: Date
}