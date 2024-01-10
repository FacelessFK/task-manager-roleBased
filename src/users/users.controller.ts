import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/uploadConf';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ROUTES } from 'src/routes/routes';
import { currentUserDto } from './dto/currentUserDto';
import path, { join } from 'path';
import { of } from 'rxjs';

@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage('avatars')))
  @UseGuards(AccessTokenGuard)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: string,
  ) {
    const user = await this.userService.uploadAvatar(
      currentUser,
      file.filename,
    );
    

    return {
      status: 200,
      message: 'user avatar successfully added',
      data: null,
    };
  }
  @Get('/get-avatar/:userId')
  @UseGuards(AccessTokenGuard)
  async findAvatar(@Param('userId') userId: string, @Res() res) {
    const user = await this.userService.findUserId(userId);
    console.log(user);

    return of(
      res.sendfile(join(process.cwd(), 'uploads/avatars/' + user.avatar)),
    );
  }
}
