import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_role: string;

  @Column()
  emp_no: string;

  @Column()
  fname: string;

  @Column({ nullable: true })
  mname: string;

  @Column()
  lname: string;

  @Column()
  mobile: string;

  @Column()
  email: string;

  @Column()
  gender: string;

  @Column()
  dob: string;

  @Column()
  address: string;

  @Column()
  department: string;

  @Column()
  designation: string;

  @Column()
  status: number;

  @Column({ default: 'N' })
  is_deleted: string;

  @Column()
  created_at: Date;

  @Column()
  created_by: string;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @OneToMany(() => User, (user) => user.employee)
  users: User[];
}

