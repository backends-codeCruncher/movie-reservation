import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';
import { Showtime } from './entities/showtime.entity';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    AuthModule,
    MoviesModule,
    CommonModule,
  ],
  exports: [TypeOrmModule, ShowtimeService],
})
export class ShowtimeModule {}
