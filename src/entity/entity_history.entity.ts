import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity({
    name: "entity_history",
})
export class EntityHistory {
    @Column({ nullable: false })
    user_id: string;

    @ManyToOne(() => User, (u: User) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    private _user: User;

    @Column({ nullable: false })
    project_id: string;

    @ManyToOne(() => Project, (u: Project) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'project_id' })
    private _project: Project;

    @Column({ nullable: false })
    public entity_name: string; // Name of the entity

    @PrimaryGeneratedColumn("uuid")
    id: string; // Request id of the request

    @Column({ type: "uuid", nullable: false })
    host_id: string;

    @Column({ type: "uuid", nullable: false })
    entity_id: string;

    @Column({ nullable: false })
    public action: string; // Action of the request

    @Column({ type: "jsonb" })
    public payload: object; // Value of that entity

    @Column({ type: "timestamptz", nullable: false })
    timestamp: Date;

    @CreateDateColumn({ type: "timestamptz", nullable: false })
    created_at: Date;
}