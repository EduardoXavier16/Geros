/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    try {
      console.log('Iniciando processo de login para:', loginDto.email);
      const { email, password } = loginDto;

      // Verificar se o email foi fornecido
      if (!email) {
        console.warn('Tentativa de login sem email');
        throw new UnauthorizedException('Email não fornecido');
      }

      // Verificar se a senha foi fornecida
      if (!password) {
        console.warn('Tentativa de login sem senha para o email:', email);
        throw new UnauthorizedException('Senha não fornecida');
      }

      console.log('Buscando usuário no banco de dados...');
      // Buscar usuário no banco de dados
      let user;
      try {
        user = await this.userRepository.findOne({ where: { email } });
        console.log(
          'Resultado da busca:',
          user ? 'Usuário encontrado' : 'Usuário não encontrado',
        );
      } catch (dbError) {
        console.error('Erro ao acessar o banco de dados:', {
          error: dbError.message,
          stack: dbError.stack,
          query: { email },
        });
        throw new Error('Erro ao acessar o banco de dados');
      }

      if (!user) {
        console.warn('Tentativa de login com email não cadastrado:', email);
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Validar senha
      console.log('Validando senha para usuário:', email);
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(
          'Resultado da validação de senha:',
          isPasswordValid ? 'Senha válida' : 'Senha inválida',
        );
      } catch (bcryptError) {
        console.error('Erro na validação da senha:', {
          error: bcryptError.message,
          stack: bcryptError.stack,
          userId: user.id,
        });
        throw new Error('Erro ao validar senha');
      }

      if (!isPasswordValid) {
        console.warn(
          'Tentativa de login com senha incorreta para o email:',
          email,
        );
        throw new UnauthorizedException('Senha incorreta');
      }

      console.log('Gerando token JWT para usuário:', email);
      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      try {
        const token = this.jwtService.sign(payload);
        console.log('Token JWT gerado com sucesso para usuário:', email);
        return {
          access_token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        };
      } catch (jwtError) {
        console.error('Erro na geração do token JWT:', {
          error: jwtError.message,
          stack: jwtError.stack,
          userId: user.id,
        });
        throw new Error('Erro ao gerar token de autenticação');
      }
    } catch (error) {
      console.error('Erro no processo de login:', {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name,
        email: loginDto.email,
      });
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro interno no servidor');
    }
  }

  async findAllUsers() {
    try {
      console.log('Iniciando busca de todos os usuários...');
      const users = await this.userRepository.find();
      console.log(`${users.length} usuários encontrados`);

      return users.map((user) => {
        const { password: _, ...result } = user;
        return result;
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Erro ao buscar lista de usuários');
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      console.log('Iniciando processo de atualização para usuário ID:', userId);

      // Buscar usuário
      console.log('Buscando usuário no banco de dados...');
      const user = await this.userRepository.findOne({ where: { id: userId } });
      console.log(
        'Resultado da busca:',
        user ? 'Usuário encontrado' : 'Usuário não encontrado',
      );

      if (!user) {
        console.warn(
          'Tentativa de atualização para usuário não encontrado:',
          userId,
        );
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Verificar senha atual
      if (!updateUserDto.currentPassword) {
        console.warn(
          'Tentativa de atualização sem senha atual para usuário:',
          userId,
        );
        throw new UnauthorizedException(
          'A senha atual é obrigatória para atualizar o perfil',
        );
      }

      // Validar senha atual
      console.log('Validando senha atual para usuário:', userId);
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(
          updateUserDto.currentPassword,
          user.password,
        );
        console.log(
          'Resultado da validação de senha:',
          isPasswordValid ? 'Senha válida' : 'Senha inválida',
        );
      } catch (bcryptError) {
        console.error('Erro na validação da senha:', {
          error: bcryptError.message,
          stack: bcryptError.stack,
          userId: user.id,
        });
        throw new Error('Erro ao validar senha atual');
      }

      if (!isPasswordValid) {
        console.warn(
          'Tentativa de atualização com senha atual incorreta:',
          userId,
        );
        throw new UnauthorizedException('Senha atual incorreta');
      }

      // Verificar email duplicado
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        console.log(
          'Verificando disponibilidade do novo email:',
          updateUserDto.email,
        );
        const emailExists = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (emailExists) {
          console.warn(
            'Tentativa de atualização com email já existente:',
            updateUserDto.email,
          );
          throw new ConflictException('Email já está em uso');
        }
        console.log('Novo email está disponível');
      }

      // Atualizar senha se fornecida
      if (updateUserDto.password) {
        console.log('Gerando hash para nova senha...');
        try {
          updateUserDto.password = await bcrypt.hash(
            updateUserDto.password,
            10,
          );
          console.log('Hash da nova senha gerado com sucesso');
        } catch (hashError) {
          console.error('Erro ao gerar hash da nova senha:', {
            error: hashError.message,
            stack: hashError.stack,
            userId: user.id,
          });
          throw new Error('Erro ao processar nova senha');
        }
      }

      // Atualizar dados do usuário
      console.log('Atualizando dados do usuário:', userId);
      const { currentPassword, ...updateData } = updateUserDto;
      Object.assign(user, updateData);

      try {
        await this.userRepository.save(user);
        console.log('Dados do usuário atualizados com sucesso:', userId);
      } catch (dbError) {
        console.error('Erro ao salvar atualizações do usuário:', {
          error: dbError.message,
          stack: dbError.stack,
          userId: user.id,
        });
        throw new Error('Erro ao salvar atualizações do usuário');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      console.error('Erro no processo de atualização do usuário:', {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name,
        userId,
      });
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(error.message || 'Erro interno ao atualizar usuário');
    }
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isAdmin) {
      throw new ForbiddenException(
        'Não é possível excluir um usuário com role de admin',
      );
    }

    await this.userRepository.delete(id);

    return { message: 'Usuário excluído com sucesso' };
  }
}
