import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { diskStorage } from 'multer';
import path from 'path';

import { Observable, of } from 'rxjs';
import { storage } from 'src/common/utils/uploadConf';

@Controller(ROUTES.TASK.ROOT)
// @ApiTags(ROUTES.WORD.ROOT)
export class TaskController {
  constructor(private taskService: TasksService) {}

  @Post(ROUTES.TASK.CREATE_task.URL)
  @UseGuards(AccessTokenGuard)
  async createTask(
    @CurrentUser() user: string,
    @Body() createTaskReqDto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(createTaskReqDto, user);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage('taskFiles')))
  @UseGuards(AccessTokenGuard)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: string,
    @Param(ROUTES.TASK.GET_task_BY_ID.PARAM) taskId: string,
  ) {
    console.log(file);
    await this.taskService.uploadFileTask(taskId, file, userId);
    return of({ imagePath: file.path });
  }

  @Get(ROUTES.TASK.GET_task.URL)
  @UseGuards(AccessTokenGuard)
  async getTasks(@CurrentUser() userId: string) {
    return await this.taskService.getUserTasks(userId);
  }

  @Get(ROUTES.TASK.GET_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async getTask(
    @CurrentUser() userId: string,
    @Param(ROUTES.TASK.GET_task_BY_ID.PARAM) taskId: string,
  ) {
    return await this.taskService.getUserTask(userId, taskId);
  }

  @Put(ROUTES.TASK.UPDATE_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async updateTask(
    @Body() updateWordRequestDto: CreateTaskDto,
    @Param(
      ROUTES.TASK.UPDATE_task_BY_ID.PARAM,
      new ParseUUIDPipe({ version: '4' }),
    )
    taskId: string,
    @CurrentUser() userId: string,
  ) {
    return await this.taskService.updateTask(
      taskId,
      updateWordRequestDto,
      userId,
    );
  }
  @Delete(ROUTES.TASK.DELETE_task_BY_ID.URL)
  @UseGuards(AccessTokenGuard)
  async deleteTask(
    @CurrentUser() userId: string,
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
}
