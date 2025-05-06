import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthService - updateUser', () => {
  let service: AuthService;
  let userRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      isAdmin: false,
    };

    it('deve atualizar o nome do usuário com sucesso', async () => {
      const updateDto = { name: 'New Name' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.updateUser('1', updateDto);

      expect(result).toEqual({
        id: '1',
        name: 'New Name',
        email: 'test@example.com',
        isAdmin: false,
      });
    });

    it('deve atualizar o email do usuário com sucesso', async () => {
      const updateDto = { email: 'newemail@example.com' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.updateUser('1', updateDto);

      expect(result.email).toBe('newemail@example.com');
    });

    it('deve atualizar a senha do usuário com sucesso', async () => {
      const updateDto = {
        currentPassword: 'oldPassword',
        password: 'newPassword',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('newHashedPassword' as never);

      const result = await service.updateUser('1', updateDto);

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });

    it('deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser('1', { name: 'New Name' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando a senha atual estiver incorreta', async () => {
      const updateDto = {
        currentPassword: 'wrongPassword',
        password: 'newPassword',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar ConflictException quando o novo email já estiver em uso', async () => {
      const updateDto = { email: 'existing@example.com' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ id: 2 });

      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
