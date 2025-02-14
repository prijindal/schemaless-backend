import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({
    name: "projects",
})
export class Project {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    public name: string;

    @Column("uuid")
    public token: string; // Token which is added in jwt, this is used for revoking generated jwts by resetting this field

    @Column()
    user_id: string;

    @ManyToOne(() => User, (u: User) => u.id, { nullable: false, persistence: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    private _user: User;

    @UpdateDateColumn({ type: "timestamptz" })
    updated_at: Date;

    @CreateDateColumn({ type: "timestamptz" })
    created_at: Date;
}
