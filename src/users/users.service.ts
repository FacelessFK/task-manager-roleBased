import { Injectable, OnModuleInit } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './schema/user.entity';

import { UserRole } from 'src/enums/role.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
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
}
