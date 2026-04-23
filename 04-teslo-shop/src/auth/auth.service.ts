import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDTO, CreateUserDTO } from './dto';
import type { PostgresError } from 'src/common/interfaces';
import type { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDTO: CreateUserDTO) {
    try {
      const { password, ...userData } = createUserDTO;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDTO: LoginUserDTO) {
    try {
      const { email, password } = loginUserDTO;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { id: true, email: true, password: true },
      });

      if (!user)
        throw new UnauthorizedException('User with given email not found');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Invalid password');

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload): string {
    const token: string = this.jwtService.sign(payload);

    return token;
  }

  private handleDBErrors(error: any): never {
    if (error instanceof QueryFailedError) {
      const driverError: PostgresError = error.driverError as PostgresError;

      if (driverError.code === '23505')
        throw new BadRequestException(driverError.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Please check server logs for more details',
    );
  }
}
