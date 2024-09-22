import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Any, ILike, QueryFailedError, Repository } from 'typeorm';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { User } from '../auth/entities/user.entity';
import { ValidGenres, ValidRates } from './enums';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger('MoviesService');

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createMovie(user: User, createMovieDto: CreateMovieDto) {
    try {
      const movie = this.movieRepository.create({
        ...createMovieDto,
        createdBy: user,
        createdAt: new Date(),
      });

      await this.movieRepository.save(movie);

      return { movie };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async updateMovie(
    user: User,
    movieId: string,
    updateMovieDto: UpdateMovieDto,
  ) {
    const movie = await this.movieRepository.preload({
      id: movieId,
      ...updateMovieDto,
      updatedBy: user,
      updatedAt: new Date(),
    });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${movieId} not found`);
    }

    try {
      await this.movieRepository.save(movie);
      return { movie };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async deleteMovie(user: User, movieId: string) {
    const movie = await this.movieRepository.preload({
      id: movieId,
    });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${movieId} not found`);
    }

    if (!movie.isAvailable) {
      throw new BadRequestException(
        `Movie with id ${movieId} is already unavailable`,
      );
    }

    movie.isAvailable = false;
    movie.deletedBy = user;
    movie.deletedAt = new Date();

    try {
      await this.movieRepository.save(movie);
      return { movie };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async getAllMovies(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const [movies, total] = await this.movieRepository.findAndCount({
      where: { isAvailable: true },
      select: {
        id: true,
        title: true,
        description: true,
        posterUrl: true,
        genres: true,
        rate: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: movies,
      meta: {
        totalMovies: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async getMoviesByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const queryBuilder = this.movieRepository.createQueryBuilder('movie');

      const [movies, total] = await queryBuilder
        .where('UPPER(title) LIKE :title', {
          title: `%${term.toUpperCase()}%`,
        })
        .orWhere('(:genre)::movies_genres_enum = ANY(movie.genres)', {
          genre: term,
        })
        .andWhere('movie.isAvailable = :isAvailable', {
          isAvailable: true,
        })
        .select([
          'movie.id',
          'movie.title',
          'movie.posterUrl',
          'movie.genres',
          'movie.rate',
        ])
        .take(limit)
        .skip((page - 1) * limit)
        .getManyAndCount();

      return {
        data: movies,
        meta: {
          totalMovies: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async getMovieById(id: string) {
    const movie = await this.movieRepository.findOneBy({ id });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return { movie };
  }

  private handleDBException(error: any) {
    this.logger.error(error);

    if (error instanceof QueryFailedError) {
      const msg = error.message;
      const errorCode = error.driverError.code;

      if (errorCode === '22P02') {
        const invalidEnum = this.getInvalidEnumMessage(msg);
        if (invalidEnum) {
          throw new BadRequestException(invalidEnum);
        }
      }
    }

    throw new InternalServerErrorException('Error on MovieService');
  }

  private getInvalidEnumMessage(msg: string): string | null {
    if (msg.includes('genres')) {
      const validGenres = Object.values(ValidGenres).join(', ');
      return `Invalid input value for enum movies_genres_enum, valid genres: ${validGenres}`;
    }

    if (msg.includes('rate')) {
      const validRates = Object.values(ValidRates).join(', ');
      return `Invalid input value for enum movies_rate_enum, valid rates: ${validRates}`;
    }

    return null;
  }
}
