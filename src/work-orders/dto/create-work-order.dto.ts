import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { EquipmentStatus } from '../entities/work-order.entity';

export class CreateWorkOrderDto {
  @ApiProperty({
    description: 'Nome do prédio onde o equipamento está localizado',
    example: 'Edifício Central',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do prédio é obrigatório' })
  buildingName: string;

  @ApiProperty({
    description: 'Número de identificação do equipamento',
    example: 'EQ-001',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'O número do equipamento é obrigatório' })
  @MaxLength(10, {
    message: 'O número do equipamento deve ter no máximo 10 dígitos',
  })
  equipmentNumber: string;

  @ApiProperty({
    description: 'Nome do cliente solicitante',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório' })
  clientName: string;

  @ApiProperty({
    description: 'Descrição detalhada do problema ou serviço necessário',
    example: 'Manutenção preventiva no ar condicionado',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({
    description: 'Nome da pessoa que está solicitando o serviço',
    example: 'Maria Oliveira',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do requerente é obrigatório' })
  requester: string;

  @ApiProperty({
    description: 'ID do usuário técnico responsável pelo serviço',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString({ message: 'O ID do técnico deve ser uma string válida' })
  @IsNotEmpty({ message: 'O ID do técnico responsável é obrigatório' })
  technicianId: string;

  @ApiProperty({
    description: 'Status atual do equipamento',
    enum: EquipmentStatus,
    example: EquipmentStatus.STOPPED,
  })
  @IsEnum(EquipmentStatus)
  @IsNotEmpty({ message: 'O status do equipamento é obrigatório' })
  equipmentStatus: EquipmentStatus;
}
