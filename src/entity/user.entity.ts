import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserStatus {
  "ACTIVATED" = "ACTIVATED",
  "DEACTIVATED" = "DEACTIVATED",
  "PENDING_VERIFICATION" = "PENDING_VERIFICATION",
}

@Entity({
  name: "users",
})
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  public username: string;

  @Column()
  public bcrypt_hash: string; // Encrypted password

  @Column("uuid")
  public token: string; // Token which is added in jwt, this is used for revoking generated jwts by resetting this field

  @Column({ type: "enum", enum: UserStatus })
  public status: UserStatus;

  @Column({ default: false })
  public is_admin: boolean;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
