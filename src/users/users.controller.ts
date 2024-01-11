import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';
import { SortRequestDto } from 'src/common/dtos/sort.dto';

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
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getLoggedInUser(@CurrentUser() user: string) {
    return user;
  }

  @Get('/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll(@Query() sortDto: SortRequestDto) {
    return await this.userService.findAll(sortDto);
  }
  @Post('/search')
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  async searchUser(@Body() search: { username: string }) {
    return await this.userService.searchUser(search);
  }
}
