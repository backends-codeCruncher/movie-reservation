import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const [users, total] = await this.userRepository.findAndCount({
      select: {
        id: true,
        username: true,
        email: true,
        roles: true,
        password: false,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: users,
      meta: {
        totalUsers: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async promoteUserToAdmin(id: string) {
    const user = await this.userRepository.preload({ id });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    if (user.roles.includes(ValidRoles.admin)) {
      throw new BadRequestException('User already has permission');
    }

    user.roles = [...user.roles, ValidRoles.admin];

    await this.userRepository.save(user);

    const { password, ...userData } = user;

    return { user: userData };
  }
}
