import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, MoviesModule, CommonModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
