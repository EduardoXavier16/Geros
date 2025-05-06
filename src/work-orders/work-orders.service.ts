import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderObservationsDto } from './dto/update-work-order-observations.dto';
import { WorkOrder, WorkOrderStatus } from './entities/work-order.entity';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto, currentUser: User) {
    try {
      console.log(
        `Iniciando criação de ordem de serviço por ${currentUser.email}`,
      );

      if (!currentUser.isAdmin) {
        console.log(
          `Tentativa de criação por usuário não administrador: ${currentUser.email}`,
        );
        throw new UnauthorizedException(
          'Apenas administradores podem criar ordens de serviço',
        );
      }

      console.log(
        `Buscando técnico com ID: ${createWorkOrderDto.technicianId}`,
      );
      const technician = await this.userRepository.findOne({
        where: { id: createWorkOrderDto.technicianId },
      });

      if (!technician) {
        console.log(
          `Técnico não encontrado com ID: ${createWorkOrderDto.technicianId}`,
        );
        throw new NotFoundException('Técnico não encontrado');
      }

      console.log(
        `Criando ordem de serviço para o técnico: ${technician.email}`,
      );
      const workOrder = this.workOrderRepository.create({
        ...createWorkOrderDto,
        requester: currentUser.name,
        technician,
      });

      const savedWorkOrder = await this.workOrderRepository.save(workOrder);
      console.log(
        `Ordem de serviço criada com sucesso. ID: ${savedWorkOrder.id}`,
      );

      // Remover dados sensíveis do técnico antes de retornar
      const sanitizedWorkOrder = {
        ...savedWorkOrder,
        technician: {
          id: technician.id,
          name: technician.name,
          email: technician.email,
          isAdmin: technician.isAdmin,
        },
      };

      return sanitizedWorkOrder;
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
      throw error;
    }
  }

  async findAll(user: User) {
    const queryBuilder = this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.technician', 'technician')
      .select([
        'workOrder',
        'technician.id',
        'technician.name',
        'technician.email',
        'technician.isAdmin',
      ]);

    if (!user.isAdmin) {
      queryBuilder.where('technician.id = :technicianId', {
        technicianId: user.id,
      });
    }

    return queryBuilder.getMany();
  }

  async assignTechnician(id: string, technicianId: string, user: User) {
    if (!user.isAdmin) {
      console.log(
        `Tentativa de atribuição por usuário não administrador: ${user.email}`,
      );
      throw new UnauthorizedException(
        'Apenas administradores podem atribuir ordens de serviço',
      );
    }

    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['technician'],
    });

    if (!workOrder) {
      console.log(`Ordem de serviço não encontrada com ID: ${id}`);
      throw new NotFoundException(
        `Ordem de serviço não encontrada. ID fornecido: ${id}`,
      );
    }

    const newTechnician = await this.userRepository.findOne({
      where: { id: technicianId },
    });

    if (!newTechnician) {
      console.log(`Técnico não encontrado com ID: ${technicianId}`);
      throw new NotFoundException(
        `Técnico não encontrado. ID fornecido: ${technicianId}`,
      );
    }

    workOrder.technician = newTechnician;
    const savedWorkOrder = await this.workOrderRepository.save(workOrder);
    console.log(
      `Ordem de serviço ${id} atribuída ao técnico ${newTechnician.email}`,
    );

    // Remover dados sensíveis do técnico antes de retornar
    const sanitizedWorkOrder = {
      ...savedWorkOrder,
      technician: {
        id: newTechnician.id,
        name: newTechnician.name,
        email: newTechnician.email,
        isAdmin: newTechnician.isAdmin,
      },
    };

    return sanitizedWorkOrder;
  }

  async updateStatus(id: string, status: WorkOrderStatus, user: User) {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['technician'],
    });

    if (!workOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    if (!user.isAdmin && workOrder.technician.id !== user.id) {
      throw new UnauthorizedException(
        'Você não tem permissão para atualizar esta ordem de serviço',
      );
    }

    if (
      !user.isAdmin &&
      ![WorkOrderStatus.ACCEPTED, WorkOrderStatus.REJECTED].includes(status)
    ) {
      throw new UnauthorizedException(
        'Técnicos só podem aceitar ou recusar ordens de serviço',
      );
    }

    workOrder.status = status;

    if (status === WorkOrderStatus.COMPLETED) {
      workOrder.completedAt = new Date();
    }

    const savedWorkOrder = await this.workOrderRepository.save(workOrder);

    // Remover dados sensíveis do técnico antes de retornar
    const sanitizedWorkOrder = {
      ...savedWorkOrder,
      technician: {
        id: workOrder.technician.id,
        name: workOrder.technician.name,
        email: workOrder.technician.email,
        isAdmin: workOrder.technician.isAdmin,
      },
    };

    return sanitizedWorkOrder;
  }

  async updateObservations(
    id: string,
    updateDto: UpdateWorkOrderObservationsDto,
    user: User,
  ) {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['technician'],
    });

    if (!workOrder) {
      console.log(`Ordem de serviço não encontrada com ID: ${id}`);
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    if (!user.isAdmin && workOrder.technician.id !== user.id) {
      console.log(
        `Tentativa de atualização por usuário não autorizado: ${user.email}`,
      );
      throw new UnauthorizedException(
        'Você não tem permissão para atualizar esta ordem de serviço',
      );
    }

    if (updateDto.observations) {
      workOrder.observations = updateDto.observations;
    }

    if (updateDto.status) {
      workOrder.status = updateDto.status;

      if (updateDto.status === WorkOrderStatus.COMPLETED) {
        workOrder.completedAt = new Date();
      }
    }

    if (updateDto.equipmentStatus) {
      workOrder.equipmentStatus = updateDto.equipmentStatus;
    }

    const savedWorkOrder = await this.workOrderRepository.save(workOrder);
    console.log(`Ordem de serviço ${id} atualizada por ${user.email}`);

    // Remover dados sensíveis do técnico antes de retornar
    const sanitizedWorkOrder = {
      ...savedWorkOrder,
      technician: {
        id: workOrder.technician.id,
        name: workOrder.technician.name,
        email: workOrder.technician.email,
        isAdmin: workOrder.technician.isAdmin,
      },
    };

    return sanitizedWorkOrder;
  }
}
