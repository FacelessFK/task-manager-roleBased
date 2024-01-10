import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/schema/user.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/auth.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { UserRole } from 'src/enums/role.enum';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  @UseGuards(AccessTokenGuard)
  async findAll(): Promise<Users[]> {
    return this.usersRepo.find();
  }
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
    const tempRole = username === 'ADMIN' ? UserRole.ADMIN : UserRole.USER;
    const { accessToken, refreshToken } = await this.getTokens(
      id,
      username,
      tempRole,
    );

    const newUser = await this.usersRepo.save({
      username,
      password,
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

  async update(id: number, updateUser: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (
      user.username === updateUser.username ||
      user.password === updateUser.password
    ) {
      throw new ForbiddenException(
        'last username or password is same as new one',
      );
    }
    const tokens = await this.getTokens(user.id, user.username, user.role);
    // Update the hashed refresh token directly
    return await this.usersRepo.update(user.id, {
      ...updateUser,
      refreshToken: tokens.refreshToken,
    });
  }
  async deleteUser(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return await this.usersRepo.delete(id);
  }
  async getTokens(userId: number, username: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          username,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '2h',
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
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

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }
}
