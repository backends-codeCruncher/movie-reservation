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
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto';
import { ShowtimeService } from './showtime.service';
import { DatePaginationDto } from '../common/dto/date-pagination.dto';

@Controller('showtime')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Post(':movieId')
  @Auth(ValidRoles.admin)
  createShowtime(
    @GetUser() user: User,
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Body() createShowtimeDto: CreateShowtimeDto,
  ) {
    return this.showtimeService.createShowtime(
      user,
      movieId,
      createShowtimeDto,
    );
  }

  @Get(':showtimeId')
  @Auth(ValidRoles.user)
  getShowtimeById(@Param('showtimeId', ParseUUIDPipe) showtimeId: string) {
    return this.showtimeService.getShowtimeById(showtimeId);
  }

  @Get('movie/:movieId')
  @Auth(ValidRoles.user)
  getShowtimesByMovieId(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Query() datePaginationDto: DatePaginationDto,
  ) {
    return this.showtimeService.getShowtimesByMovieId(
      movieId,
      datePaginationDto,
    );
  }

  @Get()
  @Auth(ValidRoles.user)
  getAllShowtimes(@Query() datePaginationDto: DatePaginationDto) {
    return this.showtimeService.getAllShowtimes(datePaginationDto);
  }

  @Patch(':showtimeId')
  @Auth(ValidRoles.admin)
  updateShowtime(
    @GetUser() user: User,
    @Param('showtimeId', ParseUUIDPipe) showtimeId: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return this.showtimeService.updateShowtime(
      user,
      showtimeId,
      updateShowtimeDto,
    );
  }

  @Delete(':showtimeId')
  @Auth(ValidRoles.admin)
  deletShowtime(
    @GetUser() user: User,
    @Param('showtimeId', ParseUUIDPipe) showtimeId: string,
  ) {
    return this.showtimeService.deleteShowtime(user, showtimeId);
  }
}
