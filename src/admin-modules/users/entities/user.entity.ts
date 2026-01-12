import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('user_login')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employee_id_fk: number;

  @Column()
  password_hash: string;

  @Column()
  username: string;

  @Column()
  isactive: number;

  @Column()
  user_role: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Employee, (employee) => employee.users)
  @JoinColumn({ name: 'employee_id_fk' })
  employee: Employee;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'user_role', referencedColumnName: 'rolecode' })
  role: Role;
}


