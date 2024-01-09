import { ConfigService } from '@nestjs/config';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/schema/user.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async getUserByUsername(username: string) {
    return await this.usersRepo.findOne({
      where: {
        username,
      },
    });
  }
  async createUser(registerRequestDto: RegisterDto) {
    const { username, password, avatar, id } = registerRequestDto;
    const user = await this.getUserByUsername(registerRequestDto.username);
    if (user) {
      throw new NotAcceptableException(
        'User with provided username already created.',
      );
    }
    console.log(id);

    const { accessToken, refreshToken } = await this.getTokens(id, username);
    const hashedPass = await this.hashData(password);
    const newUser = await this.usersRepo.save({
      username,
      password: hashedPass,
      avatar,
      refreshToken,
    });
    return {
      username: newUser.username,
      createTime: newUser.createTime,
      role: newUser.role,
      accessToken,
    };
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }
  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
}
