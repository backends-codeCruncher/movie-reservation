import { PaginationDto } from './../common/dto/pagination.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOperator, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { MoviesService } from '../movies/movies.service';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto';
import { Showtime } from './entities/showtime.entity';
import { DatePaginationDto } from '../common/dto/date-pagination.dto';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    private readonly moviesService: MoviesService,
  ) {}

  private readonly logger = new Logger('ShowtimeService');

  async createShowtime(
    user: User,
    movieId: string,
    createShowtimeDto: CreateShowtimeDto,
  ) {
    const movie = await this.moviesService.getMovieById(movieId);

    const { runtime } = movie;
    const { startTime, capacity = 100 } = createShowtimeDto;

    const endTime = new Date(startTime.getTime() + runtime * 60 * 1000);

    const showtime = this.showtimeRepository.create({
      startTime,
      endTime,
      capacity,
      movie,
      createdBy: user,
      createdAt: new Date(),
    });

    try {
      await this.showtimeRepository.save(showtime);
      return showtime;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async getShowtimeById(showtimeId: string) {
    const showtime = await this.showtimeRepository.findOne({
      where: { id: showtimeId },
      relations: ['movie'],
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime with id ${showtimeId} not found`);
    }

    return showtime;
  }

  async getShowtimesByMovieId(
    movieId: string,
    datePaginationDto: DatePaginationDto,
  ) {
    const { limit = 10, page = 1, startDate } = datePaginationDto;

    const movie = await this.moviesService.getMovieById(movieId);
    const currentDate = new Date();

    const showtimesQuery = this.showtimeRepository
      .createQueryBuilder('showtime')
      .where('showtime.movieId = :movieId', { movieId })
      .andWhere('showtime.isAvailable = true')
      .andWhere('showtime.startTime >= :currentDate', { currentDate });

    if (startDate) {
      const startOfDay = new Date(
        startDate.toLocaleString('en-US', { timeZone: 'UTC' }),
      );

      const endOfDay = new Date(
        startDate.toLocaleString('en-US', { timeZone: 'UTC' }),
      );
      endOfDay.setHours(23, 59, 59, 999);

      showtimesQuery
        .andWhere('showtime.startTime >= :startOfDay', { startOfDay })
        .andWhere('showtime.startTime < :endOfDay', { endOfDay });
    }

    const [showtimes, total] = await showtimesQuery
      .orderBy('showtime.startTime', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return {
      movie,
      data: showtimes,
      meta: {
        totalShowtimes: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async getAllShowtimes(datePaginationDto: DatePaginationDto) {
    const { limit = 10, page = 1, startDate = new Date() } = datePaginationDto;

    const [showtimes, total] = await this.showtimeRepository.findAndCount({
      where: { startTime: MoreThanOrEqual(startDate), isAvailable: true },
      relations: ['movie'],
      select: {
        id: true,
        startTime: true,
        endTime: true,
        capacity: true,
        isAvailable: true,
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
        movie: {
          id: true,
          title: true,
          description: false,
          posterUrl: false,
          genres: false,
          rate: true,
          isAvailable: false,
          createdAt: false,
          updatedAt: false,
          deletedAt: false,
        },
      },
      order: {
        startTime: 'ASC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: showtimes,
      meta: {
        totalShowtimes: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async updateShowtime(
    user: User,
    showtimeId: string,
    updateShowtimeDto: UpdateShowtimeDto,
  ) {
    const showtime = await this.getShowtimeById(showtimeId);

    const { movie, startTime } = showtime;

    const actualDate = new Date();

    if (actualDate > startTime) {
      throw new BadRequestException(`Only future showtimes can be updated.
            Showtime start: ${startTime}
            Actual time: ${actualDate}`);
    }

    const updatedShowtime = await this.showtimeRepository.preload({
      id: showtimeId,
      ...updateShowtimeDto,
      updatedBy: user,
      updatedAt: new Date(),
    });

    const { startTime: newStartTime } = updateShowtimeDto;

    if (startTime) {
      const { runtime } = movie;
      const endTime = new Date(newStartTime.getTime() + runtime * 60 * 1000);
      updatedShowtime.endTime = endTime;
    }

    try {
      await this.showtimeRepository.save(updatedShowtime);
      return updatedShowtime;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async deleteShowtime(user: User, showtimeId: string) {
    const showtime = await this.getShowtimeById(showtimeId);
    const actualDate = new Date();

    const { startTime, isAvailable } = showtime;

    if (!isAvailable) {
      throw new BadRequestException(
        `Showtime with id ${showtimeId} is already unavailable`,
      );
    }

    if (actualDate > startTime) {
      throw new BadRequestException(`Only future showtimes can be deleted.
            Showtime start: ${startTime}
            Actual time: ${actualDate}`);
    }

    const deletedShowtime = await this.showtimeRepository.preload({
      id: showtimeId,
      isAvailable: false,
      deletedBy: user,
      deletedAt: new Date(),
    });

    // Cancelar reservaciones

    try {
      await this.showtimeRepository.save(deletedShowtime);
      return deletedShowtime;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  private handleDBException(error: any) {
    this.logger.error(error.code);

    switch (error.code) {
      case '23505':
        throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Error on MovieService');
  }
}
