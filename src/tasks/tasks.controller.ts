import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { ROUTES } from 'src/routes/routes';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs';
import { storage } from 'src/common/utils/uploadConf';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/enums/role.enum';
import { SortRequestDto } from 'src/common/dtos/sort.dto';
import { currentUserDto } from 'src/users/dto/currentUserDto';

@Controller(ROUTES.TASK.ROOT)
export class TaskController {
  constructor(private taskService: TasksService) {}

  @Post(ROUTES.TASK.CREATE_task.URL)
  @UseGuards(AccessTokenGuard)
  async createTask(
    @CurrentUser() user: currentUserDto,
    @Body() createTaskReqDto: CreateTaskDto,
  ) {
    console.log(user);

    return await this.taskService.createTask(createTaskReqDto, user);
  }

  @Post('upload/:taskId')
  @UseInterceptors(FileInterceptor('file', storage('taskFiles')))
  @UseGuards(AccessTokenGuard)
  async uploadFileTask(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: currentUserDto,
    @Param('taskId') taskId: string,
  ) {
    console.log(file);
    await this.taskService.uploadFileTask(taskId, file, userId);
    return of({ imagePath: file.path });
  }
  @Post('task-image/:taskId')
  @UseInterceptors(FileInterceptor('file', storage('task-images')))
  @UseGuards(AccessTokenGuard)
  async uploadTaskImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: currentUserDto,
    @Param(ROUTES.TASK.GET_task_BY_ID.PARAM) taskId: string,
  ) {
    console.log(file);
    await this.taskService.uploadTaskImage(taskId, file, userId);
    return of({ imagePath: file.path });
  }

  @Get(ROUTES.TASK.GET_task.URL)
  @UseGuards(AccessTokenGuard)
  async getTasks(
    @CurrentUser() userId: currentUserDto,
    @Query() sortDto: SortRequestDto,
  ) {
    return await this.taskService.getUserTasks(userId, sortDto);
  }

  @Get(ROUTES.TASK.GET_ALL_task.URL)
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async getAllTasks(@Query() sortDto: SortRequestDto) {
    return await this.taskService.getAllTasks(sortDto);
  }

  @Get(ROUTES.TASK.GET_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async getTask(
    @CurrentUser() userId: currentUserDto,
    @Param(ROUTES.TASK.GET_task_BY_ID.PARAM) taskId: string,
  ) {
    return await this.taskService.getUserTask(userId, taskId);
  }

  @Put(ROUTES.TASK.UPDATE_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async updateTask(
    @Body() updateTaskRequestDto: CreateTaskDto,
    @Param(
      ROUTES.TASK.UPDATE_task_BY_ID.PARAM,
      new ParseUUIDPipe({ version: '4' }),
    )
    taskId: string,
    @CurrentUser() userId: currentUserDto,
  ) {
    return await this.taskService.updateTask(
      taskId,
      updateTaskRequestDto,
      userId,
    );
  }
  @Delete(ROUTES.TASK.DELETE_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async deleteTask(
    @CurrentUser() userId: currentUserDto,
    @Param(
      ROUTES.TASK.DELETE_task_BY_ID.PARAM,
      new ParseUUIDPipe({ version: '4' }),
    )
    taskId: string,
  ) {
    const deletedTask = await this.taskService.deleteTask(taskId, userId);
    console.log(deletedTask);

    return {
      status: 200,
      message: 'task deleted successfully',
      data: { taskID: deletedTask.id },
    };
  }
  @Post('search-user-tasks')
  @UseGuards(AccessTokenGuard)
  async searchUserTasks(
    @CurrentUser() userId: currentUserDto,
    @Body() search: { title: string },
  ) {
    return await this.taskService.searchUserTasks(userId, search);
  }
  @Post('search-all-tasks')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async searchAllTasks(@Body() search: { title: string }) {
    return await this.taskService.searchAllTasks(search);
  }
}
