import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomJwtModule } from '../jwt/jwt.module';
import { CustomPassportModule } from '../passport/passport.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    CustomPassportModule,
    CustomJwtModule,
    CommonModule,
  ],
  exports: [TypeOrmModule, JwtStrategy, CustomPassportModule, AuthService],
})
export class AuthModule {}
