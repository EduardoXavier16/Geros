import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  EquipmentStatus,
  WorkOrderStatus,
} from '../entities/work-order.entity';

export class UpdateWorkOrderObservationsDto {
  @ApiProperty({
    description: 'Observações da ordem de serviço',
    example: 'Cliente não estava presente no local.',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({
    description: 'Status da ordem de serviço',
    enum: WorkOrderStatus,
    required: false,
  })
  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @ApiProperty({
    description: 'Status do equipamento',
    enum: EquipmentStatus,
    required: false,
  })
  @IsEnum(EquipmentStatus)
  @IsOptional()
  equipmentStatus?: EquipmentStatus;
}
