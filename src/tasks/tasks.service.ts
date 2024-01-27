import { Injectable } from '@nestjs/common';
import { Tasks } from './schema/tasks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { title } from 'process';
import { SortRequestDto } from 'src/common/dtos/sort.dto';
import { currentUserDto } from 'src/users/dto/currentUserDto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tasks)
    private readonly taskRepo: Repository<Tasks>,
  ) {}
  async createTask(task: CreateTaskDto, user: currentUserDto) {
    const { id } = user;
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
  async getUserTasks(user: currentUserDto, sortTask: SortRequestDto) {
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
  async getUserTask(user: currentUserDto, taskId: string) {
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
  async uploadFileTask(
    taskId: string,
    file: Express.Multer.File,
    user: currentUserDto,
  ) {
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
  async uploadTaskImage(
    taskId: string,
    file: Express.Multer.File,
    user: currentUserDto,
  ) {
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
  async updateTask(
    taskId: string,
    updateTask: CreateTaskDto,
    user: currentUserDto,
  ) {
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

  async deleteTask(taskId: string, user: currentUserDto) {
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

  async searchUserTasks(user: currentUserDto, search: { title: string }) {
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
