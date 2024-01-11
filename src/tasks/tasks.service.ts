import { Injectable } from '@nestjs/common';
import { Tasks } from './schema/tasks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { title } from 'process';
import { SortRequestDto } from 'src/common/dtos/sort.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tasks)
    private readonly taskRepo: Repository<Tasks>,
  ) {}
  async createTask(task: CreateTaskDto, user: any) {
    const newTask = this.taskRepo.create({
      ...{ title: task.title, priority: task.priority },
      user: { id: user.id },
    });
    return await this.taskRepo.save(newTask);
  }
  async getAllTasks(sortTask: SortRequestDto) {
    const { sortType, sort } = sortTask;

    const order = {};
    order[sort] = sortType;
    const tasks = await this.taskRepo.find({
      order: order,
    });
    if (!tasks) throw new Error('Tasks not found');
    return tasks;
  }
  async getUserTasks(user: any, sortTask: SortRequestDto) {
    const { sortType, sort } = sortTask;
    const order = {};
    order[sort] = sortType;

    const tasks = await this.taskRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
      order: order,
    });
    if (!tasks) throw new Error('Tasks not found');
    return tasks;
  }
  async getUserTask(user: any, taskId: any) {
    console.log(user.id);

    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!task) throw new Error('Task not found');
    return task;
  }
  async uploadFileTask(taskId, file: Express.Multer.File, user: any) {
    const oldTask = await this.taskRepo.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!oldTask) throw new Error('Task not found');

    Object.assign(oldTask, {
      filePath: file.filename,
    });
    return await this.taskRepo.save(oldTask);
  }
  async uploadTaskImage(taskId, file: Express.Multer.File, user: any) {
    console.log(file);
    const oldTask = await this.taskRepo.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!oldTask) throw new Error('Task not found');

    Object.assign(oldTask, {
      taskImg: file.filename,
    });
    return await this.taskRepo.save(oldTask);
  }
  async updateTask(taskId, updateTask: CreateTaskDto, user: any) {
    const oldTask = await this.taskRepo.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!oldTask) throw new Error('Task not found');

    Object.assign(oldTask, {
      title: updateTask.title,
      Priority: updateTask.priority,
      filePath: updateTask.filePath,
    });
    return await this.taskRepo.save(oldTask);
  }

  async deleteTask(taskId: any, user: any) {
    // console.log(user);
    console.log(taskId);

    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!task) throw new Error('Task not found');
    return await this.taskRepo.remove(task);
  }

  async searchUserTasks(user: any, search: { title: string }) {
    const task = await this.taskRepo.find({
      where: {
        title: Like(`%${search.title}%`),
        user: {
          id: user.id,
        },
      },
    });
    if (!task || task.length <= 0) throw new Error('Task not found');
    return task;
  }
  async searchAllTasks(search: { title: string }) {
    const task = await this.taskRepo.find({
      where: {
        title: Like(`%${search.title}%`),
      },
    });

    if (!task || task.length <= 0) throw new Error('Task not found');
    return task;
  }
}
