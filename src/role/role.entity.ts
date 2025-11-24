import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('config_role')
export class Role {
  @PrimaryColumn()
  rolecode: string;

  @Column()
  rolename: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
