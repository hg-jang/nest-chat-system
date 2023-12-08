import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  async logIn(@Body() params: { userId: number }, @Res() res: Response) {
    try {
      const user = await this.userService.user({ id: params.userId });
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false });
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: user,
      });
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false });
    }
  }

  @Get('/others')
  async getOtherUsers(@Query('myId') userId: number, @Res() res: Response) {
    try {
      const users = await this.userService.users({
        where: {
          id: {
            not: userId,
          },
        },
      });
      if (users.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false });
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: users,
      });
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false });
    }
  }
}
