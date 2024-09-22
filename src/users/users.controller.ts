import { Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth(ValidRoles.admin)
  getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getAllUsers(paginationDto);
  }

  @Patch('promote/:id')
  @Auth(ValidRoles.admin)
  promoteUserToAdmin(@Param('id', ParseUUIDPipe) id: string){
    return this.usersService.promoteUserToAdmin(id);
  }
}
