import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('config_role')
export class Roles {

 @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rolecode: string;

  @Column()
  rolename: string;

 @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  created_by: string;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
