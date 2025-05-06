import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { SanitizedWorkOrder } from './dto/sanitized-work-order.dto';
import { UpdateWorkOrderObservationsDto } from './dto/update-work-order-observations.dto';
import { WorkOrderStatus } from './entities/work-order.entity';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Ordens de Serviço')
@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Criar uma nova ordem de serviço' })
  @ApiResponse({
    status: 201,
    description: 'Ordem de serviço criada com sucesso',
    type: SanitizedWorkOrder,
  })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado - apenas administradores podem criar ordens de serviço',
  })
  @ApiResponse({ status: 404, description: 'Técnico não encontrado' })
  create(
    @Body() createWorkOrderDto: CreateWorkOrderDto,
    @Request() req,
  ): Promise<SanitizedWorkOrder> {
    console.log('[WorkOrdersController] Iniciando criação de ordem de serviço');
    console.log(
      '[WorkOrdersController] Dados recebidos:',
      JSON.stringify(createWorkOrderDto),
    );
    console.log('[WorkOrdersController] Usuário:', JSON.stringify(req.user));
    return this.workOrdersService.create(createWorkOrderDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as ordens de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens de serviço retornada com sucesso',
    type: [SanitizedWorkOrder],
  })
  findAll(@Request() req): Promise<SanitizedWorkOrder[]> {
    console.log('[WorkOrdersController] Buscando todas as ordens de serviço');
    console.log('[WorkOrdersController] Usuário:', JSON.stringify(req.user));
    return this.workOrdersService.findAll(req.user);
  }

  @Patch(':id/assign-technician')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Atribuir uma ordem de serviço a um técnico',
    description:
      'Atribui um técnico a uma ordem de serviço específica. O ID na URL é o identificador da ordem de serviço, e o technicianId no corpo da requisição é o ID do técnico que será atribuído.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordem de serviço atribuída com sucesso ao técnico',
    type: SanitizedWorkOrder,
  })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado - apenas administradores podem atribuir ordens de serviço',
  })
  @ApiResponse({
    status: 404,
    description:
      'Ordem de serviço não encontrada com o ID fornecido ou técnico não encontrado com o ID fornecido no corpo da requisição',
  })
  async assignTechnician(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
    @Request() req,
  ): Promise<SanitizedWorkOrder> {
    console.log('[WorkOrdersController] Atribuindo ordem de serviço a técnico');
    console.log('[WorkOrdersController] ID da OS:', id);
    console.log('[WorkOrdersController] ID do técnico:', technicianId);
    console.log('[WorkOrdersController] Usuário:', JSON.stringify(req.user));
    return this.workOrdersService.assignTechnician(id, technicianId, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de uma ordem de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Status da ordem de serviço atualizado com sucesso',
    type: SanitizedWorkOrder,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Ordem de serviço não encontrada' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
    @Request() req,
  ): Promise<SanitizedWorkOrder> {
    console.log(
      '[WorkOrdersController] Atualizando status da ordem de serviço',
    );
    console.log('[WorkOrdersController] ID:', id);
    console.log('[WorkOrdersController] Novo status:', status);
    console.log('[WorkOrdersController] Usuário:', JSON.stringify(req.user));
    return this.workOrdersService.updateStatus(id, status, req.user);
  }

  @Patch(':id/observations')
  @ApiOperation({
    summary: 'Atualizar as observações e/ou status de uma ordem de serviço',
    description:
      'Permite atualizar as observações e opcionalmente o status da ordem de serviço em uma única operação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordem de serviço atualizada com sucesso',
    type: SanitizedWorkOrder,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Ordem de serviço não encontrada' })
  updateObservations(
    @Param('id') id: string,
    @Body() updateWorkOrderObservationsDto: UpdateWorkOrderObservationsDto,
    @Request() req,
  ): Promise<SanitizedWorkOrder> {
    console.log('[WorkOrdersController] Atualizando ordem de serviço');
    console.log('[WorkOrdersController] ID:', id);
    if (updateWorkOrderObservationsDto.observations) {
      console.log(
        '[WorkOrdersController] Observações:',
        updateWorkOrderObservationsDto.observations,
      );
    }
    if (updateWorkOrderObservationsDto.status) {
      console.log(
        '[WorkOrdersController] Status:',
        updateWorkOrderObservationsDto.status,
      );
    }
    console.log('[WorkOrdersController] Usuário:', JSON.stringify(req.user));
    return this.workOrdersService.updateObservations(
      id,
      updateWorkOrderObservationsDto,
      req.user,
    );
  }
}
