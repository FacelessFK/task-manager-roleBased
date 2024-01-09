import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post()
  async register(@Body() dto: RegisterDto): Promise<any> {
    const newUser = await this.authService.createUser(dto);

    return {
      status: 201,
      message: 'user created successfully',
      data: { newUser },
    };
  }
}
