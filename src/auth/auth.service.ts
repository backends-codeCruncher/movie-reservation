import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { bcryptAdapter } from 'src/config';
import { Repository } from 'typeorm';
import { LoginDto, SignupDto } from './dto';
import { User } from './entities/user.entity';
import { JWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { password, ...userData } = signupDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcryptAdapter.hash(password),
    });

    await this.userRepository.save(user);

    const { password: _, ...data } = user;

    return { ...data };
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException(
        `User with email ${email} does not exist`,
      );
    }

    if (!bcryptAdapter.compare(password, user.password)) {
      throw new UnauthorizedException('Credetianls are not valid');
    }

    const token = this.getJWT({ id: user.id });

    const { password: _, ...userData } = user;

    return {
      user: { ...userData },
      token: token,
    };
  }

  private getJWT(payload: JWTPayload) {
    return this.jwtService.sign(payload);
  }
}
