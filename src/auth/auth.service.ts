import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/schema/user.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
