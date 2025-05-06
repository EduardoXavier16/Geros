import { ApiProperty } from '@nestjs/swagger';
import {
  EquipmentStatus,
  WorkOrderStatus,
} from '../entities/work-order.entity';

class SanitizedTechnician {
  @ApiProperty({ description: 'ID do técnico' })
  id: string;

  @ApiProperty({ description: 'Nome do técnico' })
  name: string;

  @ApiProperty({ description: 'Email do técnico' })
  email: string;

  @ApiProperty({ description: 'Indica se o técnico é administrador' })
  isAdmin: boolean;
}

export class SanitizedWorkOrder {
  @ApiProperty({ description: 'ID da ordem de serviço' })
  id: string;

  @ApiProperty({ description: 'Nome do edifício' })
  buildingName: string;

  @ApiProperty({ description: 'Número do equipamento' })
  equipmentNumber: string;

  @ApiProperty({ description: 'Nome do cliente' })
  clientName: string;

  @ApiProperty({ description: 'Descrição da ordem de serviço' })
  description: string;

  @ApiProperty({ description: 'Nome do solicitante' })
  requester: string;

  @ApiProperty({
    description: 'Informações do técnico responsável',
    type: SanitizedTechnician,
  })
  technician: SanitizedTechnician;

  @ApiProperty({
    description: 'Status da ordem de serviço',
    enum: WorkOrderStatus,
  })
  status: WorkOrderStatus;

  @ApiProperty({ description: 'Status do equipamento', enum: EquipmentStatus })
  equipmentStatus: EquipmentStatus;

  @ApiProperty({ description: 'Data de criação da ordem de serviço' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de conclusão da ordem de serviço',
    required: false,
  })
  completedAt: Date;
}
