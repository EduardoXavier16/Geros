import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum EquipmentStatus {
  STOPPED = 'stopped',
  FLOOR_DISABLED = 'floor_disabled',
  WORKING = 'working',
}

@Entity()
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buildingName: string;

  @Column({ length: 10 })
  equipmentNumber: string;

  @Column()
  clientName: string;

  @Column()
  description: string;

  @Column()
  requester: string;

  @ManyToOne(() => User, { eager: true })
  technician: User;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING,
  })
  status: WorkOrderStatus;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.STOPPED,
  })
  equipmentStatus: EquipmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;
}
