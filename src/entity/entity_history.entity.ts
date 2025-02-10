import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity({
    name: "entity_history",
})
export class EntityHistory {
    @Column()
    user_id: string;

    @ManyToOne(() => User, (u: User) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    private _user: User;

    @Column()
    project_id: string;

    @ManyToOne(() => Project, (u: Project) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'project_id' })
    private _project: Project;

    @Column()
    public name: string; // Name of the entity

    @PrimaryColumn("uuid")
    id: string; // Request id of the request

    @Column()
    public action: string; // Action of the request

    @Column({ type: "jsonb" })
    public payload: object; // Value of that entity

    @CreateDateColumn()
    created_at: Date;
}