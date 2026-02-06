import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('departments')
export class Departments {
  
  @PrimaryGeneratedColumn()
  id: number;

@Column({ length: 5 })
  code: string;

  @Column({ length: 50 })
  value: string;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

}


