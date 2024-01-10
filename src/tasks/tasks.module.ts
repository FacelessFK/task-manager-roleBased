import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Tasks } from './schema/tasks.entity';
import { TasksService } from './tasks.service';
import { TaskController } from './tasks.controller';

import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Tasks])],
  controllers: [TaskController],
  providers: [TasksService],
})
export class TasksModule {}
