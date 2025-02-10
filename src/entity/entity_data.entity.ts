import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity({
    name: "entity_data",
})
export class EntityData {
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
    id: string;

    @Column({ type: "jsonb" })
    public content: object; // Value of that entity

    @UpdateDateColumn({ type: "timestamptz" })
    updated_at: Date;

    @CreateDateColumn({ type: "timestamptz" })
    created_at: Date;
}