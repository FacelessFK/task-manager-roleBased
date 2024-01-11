import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Users } from './schema/user.entity';
import { UserRole } from 'src/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { currentUserDto } from './dto/currentUserDto';
import { SortRequestDto } from 'src/common/dtos/sort.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async onModuleInit() {
    const user = await this.usersRepo.findOne({
      where: {
        username: 'ADMIN',
      },
    });
    if (!user) {
      await this.usersRepo.save({
        username: 'ADMIN',
        password: '12345',
        role: UserRole.ADMIN,
      });
    }
  }
  async findUser(username: string): Promise<Users> {
    return await this.usersRepo.findOne({
      where: { username },
    });
  }
  async findUserId(userID): Promise<Users> {
    return await this.usersRepo.findOne({
      where: { id: userID },
    });
  }
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });

    Object.assign(user, updateUserDto);
    await this.usersRepo.save(user);
    return user;
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

  async updateUser(id: number, updateUser: UpdateUserDto) {
    console.log(id);

    const user = await this.usersRepo.findOne({ where: { id: id } });
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
  async findAll(sortUsers: SortRequestDto): Promise<Users[]> {
    const { sortType, sort } = sortUsers;
    const order = {};
    order[sort] = sortType;

    const user = await this.usersRepo.find({
      order: order,
    });
    if (!user) throw new Error('users not found');
    return user;
  }
  async searchUser(search: { username: string }): Promise<Users[]> {
    const user = await this.usersRepo.find({
      where: {
        username: Like(`%${search.username}%`),
      },
    });
    if (!user) throw new Error('users not found');
    return user;
  }

  async uploadAvatar(userd, avatar: string) {
    const user = await this.usersRepo.findOne({ where: { id: userd.id } });
    console.log(user);

    if (!user) throw new NotFoundException('User not found');
    return await this.usersRepo.update(user.id, { avatar });
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
