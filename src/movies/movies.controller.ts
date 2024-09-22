import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ValidRoles } from './../auth/enums/valid-roles.enum';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  createMovie(@GetUser() user: User, @Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.createMovie(user, createMovieDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  updateMovie(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) movieId: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.updateMovie(user, movieId, updateMovieDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  deleteMovie(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) movieId: string,
  ) {
    return this.moviesService.deleteMovie(user, movieId);
  }

  @Get()
  @Auth(ValidRoles.user)
  getAllMovies(@Query() paginationDto: PaginationDto) {
    return this.moviesService.getAllMovies(paginationDto);
  }

  @Get(':term')
  @Auth(ValidRoles.user)
  getAllMoviesByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.moviesService.getMoviesByTerm(term, paginationDto);
  }

  @Get('movie/:id')
  @Auth(ValidRoles.user)
  getMovieById(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.getMovieById(id);
  }
}
