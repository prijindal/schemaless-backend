import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity({
    name: "app_keys",
})
export class AppKey {
    @PrimaryGeneratedColumn("uuid")
    id: string;

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
    public bcrypt_hash: string; // Encrypted password

    @CreateDateColumn({ type: "timestamptz" })
    created_at: Date;
}