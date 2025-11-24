import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_screens')
export class ConfigScreens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parent_menu: number;

  @Column({ nullable: true })
  menu_name: string;

  @Column({ nullable: true })
  icon_menu: string;

  @Column({ nullable: true })
  sort_order: number;

  @Column({ nullable: true })
  internal_routing: string;

  @Column({ nullable: true })
  routing_name: string;

  @Column({ nullable: true })
  is_admin: number;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  updated_at: Date;
}
