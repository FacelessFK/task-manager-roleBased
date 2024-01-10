import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { LoginResponse } from './types/loginResponse';
import { Users } from 'src/users/schema/user.entity';
import { Roles } from '../common/decorator/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetCurrentUser } from 'src/common/decorator/get-current-user.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Hash } from 'src/common/utils/Hash';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { RegisterDto } from 'src/users/dto/create-user.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post('/register')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async register(@Body() dto: RegisterDto): Promise<any> {
    const newUser = await this.userService.createUser(dto);

    return {
      status: 201,
      message: 'user created successfully',
      data: { newUser },
    };
  }
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async update(@Param('id') params: string, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.userService.updateUser(+params, dto);
    return {
      status: 200,
      message: 'user updated successfully',
      data: null,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async deleteUser(@Param('id') userId: string) {
    const deletedUser = await this.userService.deleteUser(+userId);
    return {
      status: 200,
      message: 'user deleted successfully',
      data: null,
    };
  }

  @Post('/login')
  async login(@Body() loginUser: LoginUserDto): Promise<LoginResponse> {
    const { username, password: loginPassword } = loginUser;
    // let user: Omit<Users, 'createdAt' | 'updatedAt'>;

    let user = await this.userService.findUser(username);

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const isValid = await Hash.compare(loginPassword, user.password);

    if (!isValid) throw new HttpException('Invalid credentials', 401);

    const { id, username: existingUsernam } = user;
    let { password, ...userN } = user;

    const tempRole = username === 'ADMIN' ? UserRole.ADMIN : UserRole.USER;
    const tokens = this.userService.getTokens(id, username, tempRole);

    return tokens;
  }
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getLoggedInUser(@CurrentUser() user: string) {
    return user;
  }

  @Get('/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll() {
    return await this.userService.findAll();
  }
}
