import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emp_no: string;

  @Column()
  fname: string;

  @Column({ nullable: true })
  mname: string;

  @Column()
  lname: string;

  @OneToMany(() => User, (user) => user.employee)
  users: User[];
}

