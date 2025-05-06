import {
  EquipmentStatus,
  WorkOrderStatus,
} from '../entities/work-order.entity';

interface SanitizedTechnician {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface SanitizedWorkOrder {
  id: string;
  buildingName: string;
  equipmentNumber: string;
  clientName: string;
  description: string;
  requester: string;
  technician: SanitizedTechnician;
  status: WorkOrderStatus;
  equipmentStatus: EquipmentStatus;
  createdAt: Date;
  completedAt: Date;
}
