import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('designations')
export class Designations {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  value: string;

  @Column({ type: 'timestamp' })
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


