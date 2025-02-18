import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({
    name: "entity_history",
})
@Index(["user_id", "project_key"])
export class EntityHistory {
    @Column({ nullable: false })
    user_id: string;

    @Column({ nullable: false })
    project_key: string;

    @ManyToOne(() => User, (u: User) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    private _user: User;

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